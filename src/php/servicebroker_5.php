<?php 
	/**
	 *  Appcelerator SDK
	 *  Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
	 *  For more information, please visit http://www.appcelerator.org
	 *
	 *  This program is free software; you can redistribute it and/or modify
	 *  it under the terms of the GNU General Public License as published by
	 *  the Free Software Foundation; either version 2 of the License, or
	 *  (at your option) any later version.
	 *
	 *  This program is distributed in the hope that it will be useful,
	 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
	 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 *  GNU General Public License for more details.
	 *
	 *  You should have received a copy of the GNU General Public License along
	 *  with this program; if not, write to the Free Software Foundation, Inc.,
	 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
	 */
	
	// change this to something (anything) but what it is now
	// you can also set this to null if you don't want server-to-server communication
	$my_secret_key = null;
	$shared_secret = is_null($my_secret_key) ? null : md5($my_secret_key); 

	//---------------------------------------------------------------------------------
	//
	// Everything below here is the core framework and requires no configuration
	//
	//---------------------------------------------------------------------------------


	session_name('PHPSESSID');
	session_start();
	$sessionid = session_id();

	//
	// figure out what we're receiving
	//
	$method = $_SERVER['REQUEST_METHOD'];
	
	$instanceid = $_GET['instanceid'];
	$auth = $_GET['auth'];
	$init = $_GET['init'];
	
	if ($init=='1')
	{
		// just used to get the session going
		return;
	}
	
	$badrequest = false;

	//
	// security check to make sure we're getting requests
	// from our client
	//
	
	if (is_null($instanceid) || is_null($auth))
	{
		$badrequest = true;
	}
	else if ($auth!=$shared_secret)
	{
        $check = md5($sessionid.$instanceid);
		if ($check!=$auth)
		{
			$badrequest = true;
		}
	}
	
	if ($badrequest)
	{
		header('Content-Length: 0');
		header('Content-type: text/plain');
		header('HTTP/1.0 400 Bad Request');
		print "Invalid request\n";
		return;
	}
	
	if ($method == 'GET')
	{
		/**
		 * NOTE: this function doesn't do anything since PHP doesn't really support asynchronous
		 * behaviour (at least not cross-platform)
		 */
		header('Content-type: text/xml');
		print "<?xml version='1.0'?>\n";
		print "<messages version='1.0' sessionid='$sessionid'/>\n";
		return;
	}
	else if ($method != 'POST')
	{
		header('HTTP/1.0 405 Method Not Allowed');
		header("Allow: GET POST");
		print "Invalid method\n";
		return;
	}

	function searchdir ( $path , $maxdepth = -1 , $mode = "FULL" , $d = 0 )
	{
	   if ( substr ( $path , strlen ( $path ) - 1 ) != '/' ) { $path .= '/' ; }     
	   $dirlist = array () ;
	   if ( $mode != "FILES" ) { $dirlist[] = $path ; }
	   if ( $handle = opendir ( $path ) )
	   {
	       while ( false !== ( $file = readdir ( $handle ) ) )
	       {
	           if ( $file != '.' && $file != '..' )
	           {
	               $file = $path . $file ;
	               if ( ! is_dir ( $file ) ) { if ( $mode != "DIRS" ) { $dirlist[] = $file ; } }
	               elseif ( $d >=0 && ($d < $maxdepth || $maxdepth < 0) )
	               {
	                   $result = searchdir ( $file . '/' , $maxdepth , $mode , $d + 1 ) ;
	                   $dirlist = array_merge ( $dirlist , $result ) ;
	               }
	       }
	       }
	       closedir ( $handle ) ;
	   }
	   if ( $d == 0 ) { natcasesort ( $dirlist ) ; }
	   return ( $dirlist ) ;
	}
	
	function getServiceMetadata($str)
	{
	    $matches = array();
	    preg_match("/@Service[\s]*\([\s]*request[\s]*=(.*)?[\s]*[,]{0,1}[\s]*(response[\s]*=[\s]*(.*)?)+[,]{0,1}(version[\s]*=[\s]*([0-9]+[.]{0,1}[0-9]*)){0,1}\)/U", $str, $matches);
		$array = array();
		$array['request']=$matches[1];
		$array['response']=isset($matches[3]) ? $matches[3] : '';
		$array['version']=isset($matches[5]) ? $matches[5] : '1.0';
	    return $array;
	}
	
	final class ServiceAdapter
	{
		private $service;
		private $method;
		private $metadata;
		
		public function __construct(&$service,&$method,&$metadata)
		{
			$this->service = $service;
			$this->method = $method;
			$this->metadata = $metadata;
		}
		public function getVersion ()
		{
			return $this->metadata['version'];
		}
		public function getResponseType ()
		{
			return $this->metadata['response'];
		}
		public function dispatch (&$request,&$response)
		{
			$this->method->invoke($this->service,$request,$response);
		}
	}

	$services = array();

	function registerService ($type, &$handler, &$handlers)
	{
		if (!array_key_exists($type,$handlers))
		{
			$handlers[$type] = array();
		}
		$array = $handlers[$type];
		array_push($array,$handler);
		$handlers[$type]=$array;
	}
	
	//
	// scan directory and load our services up
	//
	$dir = dirname(__FILE__) . '/services';
	$files = searchdir($dir,-1,"FILES");
	foreach ($files as $i => $value)
	{
		$tokens = split('[.]',$value);
		$name = substr($tokens[0],strlen($dir)+1);
		
		if (stristr($name,'Service'))
		{
			$tokens = split('_',$name);
			$str = '';
			foreach ($tokens as $t => $token)
			{
				$str = $str . strtoupper(substr($token,0,1)) . substr($token,1);
			}
			if ($str != '')
			{
				require_once $value;
				$instance = new $str;
				$methods = get_class_methods($instance);
				foreach ($methods as $m => $method)
				{
					$rm = new ReflectionMethod($str,$method);
					if ($rm->isUserDefined() && $rm->isPublic() && 
					   !$rm->isConstructor() && !$rm->isDestructor() && $rm->getNumberOfParameters()==2)
					{
						$comment = $rm->getDocComment();
						$metadata = getServiceMetadata($comment);
						$request = $metadata['request'];
						$adapter = new ServiceAdapter($instance,$rm,$metadata);
						registerService($request,$adapter,$services);
					}
				}
			}
		}
	}

	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
	header('Pragma: no-cache');
    header('Cache-control: no-cache, no-store, private, must-revalidate');

	$post = file_get_contents("php://input");
	$dom = new DOMDocument();
    $dom->loadXML($post);
    $nodes = $dom->documentElement->childNodes;

    $responseDom = new DOMDocument();
    $responseElement = $responseDom->createElement('messages');
    $responseElement->setAttribute('version','1.0');
    if (!is_null($sessionid))
	{
		$responseElement->setAttribute('sessionid',$sessionid);
	}
    $responseDom->appendChild($responseElement);

	function toXML ($dom, $response)
	{
		$element = $dom->createElement('message');
		$element->setAttribute('type',$response['type']);
		$element->setAttribute('requestid',$response['requestid']);
		$element->setAttribute('datatype','JSON');
		$element->setAttribute('direction','OUTGOING');
		$element->setAttribute('timestamp',time());
		$cdata = $dom->createCDATASection(json_encode($response['data']));
		$element->appendChild($cdata);
		return $element;
	}
	
	$count = 0;

	//
	// process each incoming service request
	//
    foreach ($nodes as $node)
    {
         if ($node->nodeType == XML_ELEMENT_NODE)
         {
            // pull out message type and parse JSON body
			$cdata = '';
			foreach ($node->childNodes as $child)
			{
				$cdata = $cdata . $child->nodeValue;
			}
			$type = $node->getAttribute('type');
			if (array_key_exists($type,$services))
			{
				$request = array();
				$request['scope'] = $node->getAttribute('scope');
				$request['version'] = $node->getAttribute('version');
				$request['data'] = json_decode($cdata,true);
				//echo("decode:" . var_dump($request['data']));
				$request['requestid'] = $node->getAttribute('requestid');
				$array = $services[$type];
				foreach ($array as $handler)
				{
					if ($handler->getVersion() == $request['version'])
					{
						//
						// dispatch to the service and get response message (optional)
						//
						$responseType = $handler->getResponseType();
						if (is_null($responseType))
						{
							$handler->dispatch($request,null);
						}
						else
						{
							$data = array();
							$response = array();
							$response['scope']=$request['scope'];
							$response['version']=$request['version'];
							$response['type']=$responseType;
							$response['requestid']=$request['requestid'];
							$response['data']=&$data;
							$handler->dispatch($request,$response);
							$element = toXML($responseDom, $response);
							$responseElement->appendChild($element);
							$count++;
						}
					}
				}
			}
         }
    }
	
	//
	// return our response based on whether we have responses or not
	//
	if ($count > 0)
	{
		header('Content-type: text/xml');
		print $responseDom->saveXML();
	}
	else
	{
		header('Content-Length: 0');
		header('Content-type: text/plain');
		header('HTTP/1.0 202 Accepted');
	}
?>