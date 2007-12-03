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
	$shared_secret = is_null($my_secret_key) ? null :
	md5($my_secret_key);

	//---------------------------------------------------------------------------------
	//
	// Everything below here is the core framework and requires no configuration
	//
	//---------------------------------------------------------------------------------

	require_once("json.php");
	$json = new Services_JSON();
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
		preg_match("/@Service[\s]*\([\s]*request[\s]*=(.*)?[\s]*[,]{0,1}[\s]*(response[\s]*=[\s]*(.*)?)+[,]{0,1}". "(version[\s]*=[\s]*([0-9]+[.]{0,1}[0-9]*)){0,1}\)/U", $str, $matches);
		$array = array();
		$array['request']=$matches[1];
		$array['response']=isset($matches[3]) ? $matches[3] : '';
		$array['version']=isset($matches[5]) ? $matches[5] : '1.0';
		return $array;
	}

	/*      final class ServiceAdapter */
	class ServiceAdapter
	{
		var $service;
		var $method;
		var $metadata;

		function ServiceAdapter(&$service, &$method, &$metadata)
		{
			$this->service = $service;
			$this->method = $method;
			$this->metadata = $metadata;
		}
		function getVersion ()
		{
			return $this->metadata['version'];
		}
		function getResponseType ()
		{
			return $this->metadata['response'];
		}
		function dispatch (&$request,&$response)
		{
			call_user_func_array(array($this->service,$this->method),array($request,$response));
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

	define('START_DOC', '/**');
	define('END_DOC', '*/');
	function getFileNotations( $strFile )
	{
	    $strText = file_get_contents( $strFile );
	    $arrText = explode( "\n" , $strText );
   
	    $arrNotations = array();
   
	    for ( $intCount = 0 ; $intCount < count( $arrText ) ; ++$intCount )
	    {
	        $strLine = $arrText[ $intCount ];
       
	        // inside the phpdoc //
	        if ( strpos( trim( $strLine ) , START_DOC ) === 0 )
	        {
	            ++$intCount;
	            $strLine = $arrText[ $intCount ];
	            $arrNotation = array();
           
	            // while the phpdoc is not finished //
	            while ( ( strpos( trim( $strLine ) , END_DOC ) !== 0 ) and ( $intCount < count( $arrText ) ) )
	            {
	                // get the name of the tag //
	                $strName = substr( $strLine , 0 , strpos( $strLine , ' ' ) );
	                // get the value of the tag //
	                $strLine = substr( $strLine , strpos( $strLine , ' ' ) + 1 );
               
	                if ( strpos( trim( $strLine ) , '*' ) === 0 )
	                {
	                    $strLine = substr( $strLine , strpos( $strLine , '*' ) + 1 );
	                }
               
	                $strLine = trim( $strLine );
	                if ( ! isset( $arrNotation[ $strName ] ) )
	                {
	                    $arrNotation[ $strName ] = '';
	                }
	                else
	                {
	                    if ( $strLine != '' )
	                    {
	                        $arrNotation[ $strName ] .= "\n";
	                    }
	                }
	                $arrNotation[ $strName ] .= trim( $strLine );
	                ++$intCount;
	                $strLine = $arrText[ $intCount ];
	            }
	            if ( $intCount < count( $arrText ) )
	            {
	                do
	                {
	                    ++$intCount;
	                    $strLine = $arrText[ $intCount ];
	                }
	                while ( $strLine == '' );
	                // adding the notation to the next command line //
	                $arrNotations[ trim( $arrText[ $intCount ] ) ] = $arrNotation;
	                $intCount--;
	            }
	        }
	    }
	    return( $arrNotations );
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
				$annotations = getFileNotations($value);
				require_once $value;
				$instance = new $str;
				$methods = get_class_methods($instance);
				foreach ($methods as $m => $method)
				{
					$key = null;
					$comment = null;
					foreach ($annotations as $a => $annotation)
					{
						if (stristr($a, $method))
						{
							foreach ($annotation as $text)
							{
								$comment = $comment . $text;
							}
							$key = $a;
							break;
						}
					}

					$metadata = getServiceMetaData($comment);
					$request = $metadata['request'];
					$adapter = new ServiceAdapter($instance,$method,$metadata);
					registerService($request,$adapter,$services);
				}
			}
		}
	}

	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
	header('Pragma: no-cache');
	header('Cache-control: no-cache, no-store, private, must-revalidate');

	$post = file_get_contents("php://input");

	$version = NULL;
	$sessionid = NULL;
	$messageAttrs = NULL;
	$cdata = "";

	function startElement($parser, $name, $attrs) 
	{
		global $version, $sessionid, $messageAttrs, $cdata;
		switch ($name)
		{
			case 'MESSAGES':
			{
				foreach ($attrs as $key=>$value)
				{
					switch($key)
					{
						case 'VERSION':
							$version = $value;
							break;
						case 'SESSIONID':
							$sessionid = $value;
							break;
					}
				}
				break;
			}
			case 'MESSAGE':
			{
				$messageAttrs = $attrs;
				$cdata = '';
				break;
			}
	   	}
	}
	
	function endElement ($parser, $name)
	{
		global $messageAttrs, $cdata, $services, $json, $responses;
		if ($name=='MESSAGE')
		{
			$request = array();
			$request['scope']  = isset($messageAttrs['SCOPE']) ? $messageAttrs['SCOPE'] : 'appcelerator';
			$request['version'] = isset($messageAttrs['VERSION']) ? $messageAttrs['VERSION'] : '1.0';
			$request['data'] = get_object_vars($json->decode($cdata));
			$request['requestid'] =  $messageAttrs['REQUESTID'];
			$request['type'] = $messageAttrs['TYPE'];

			$array = $services[$request['type']];
			if (isset($array))
			{
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
							$response = array();
							$handler->dispatch($request,$response);
						}
						else
						{
							$response = array();
							$response['scope'] = $request['scope'];
							$response['version'] = $request['version'];
							$response['type'] = $responseType;
							$response['requestid'] = $request['requestid'];
							$data = array();
							$response['data'] = &$data;
							$handler->dispatch($request,$response);
							array_push($responses,$response);
						}
					}
				}
			}
		}
	}

	function characterData($parser, $data) 
	{
		global $cdata;
		$cdata = $cdata . $data;
	}

	$responses = array();
	
	$xml_parser = xml_parser_create();
	xml_set_element_handler($xml_parser, "startElement", "endElement");
	xml_set_character_data_handler($xml_parser, "characterData");
	xml_parse($xml_parser, $post);
	
	$response = '<?xml version="1.0"?>';
	$response = $response . '<messages version="$version" sessionid="$sessionid">';
	
	foreach ($responses as $r)
	{
		$response = $response . '<message requestid="' . $r['requestid'] . '" direction="OUTGOING" datatype="JSON" type="' . $r['type'] . '" scope="' . $r['scope'] . '"><![CDATA[' . $json->encode($r['data']) . ']]></message>';
	}
	
	$response = $response . '</messages>';

	//
	// return our response based on whether we have responses or not
	//
	if (count($responses) > 0)
	{
		header('Content-type: text/xml');
		print $response;
	}
	else
	{
		header('Content-Length: 0');
		header('Content-type: text/plain');
		header('HTTP/1.0 202 Accepted');
	}
?>