<?php 
	/*!
	 * This file is part of Appcelerator.
	 *
	 * Copyright (c) 2006-2008, Appcelerator, Inc.
	 * All rights reserved.
	 * 
	 * Redistribution and use in source and binary forms, with or without modification,
	 * are permitted provided that the following conditions are met:
	 * 
	 *     * Redistributions of source code must retain the above copyright notice,
	 *       this list of conditions and the following disclaimer.
	 * 
	 *     * Redistributions in binary form must reproduce the above copyright notice,
	 *       this list of conditions and the following disclaimer in the documentation
	 *       and/or other materials provided with the distribution.
	 * 
	 *     * Neither the name of Appcelerator, Inc. nor the names of its
	 *       contributors may be used to endorse or promote products derived from this
	 *       software without specific prior written permission.
	 * 
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
	 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 **/

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
        public function dispatch (&$request, &$response)
        {
            $this->method->invoke($this->service,$request,$response);
        
            if ($response !== null) {
                $response['timestamp'] = time();
            }
        }
    }

    //
    // scan directory and load our services up
    //
    $files = searchdir($dir,-1,"FILES");
    foreach ($files as $i => $value)
    {
        $right = strrpos($value,'.');
        $left = strlen($dir)+1;
        $name = substr($value,$left,$right-$left);
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
                    if ($rm->isUserDefined() && !$rm->isConstructor() && !$rm->isDestructor() && $rm->getNumberOfParameters()==2)
                    {
                        $comment = $rm->getDocComment();
                        $metadata = getServiceMetadata($comment);

                        if ($metadata === FALSE) // could not parse metadata
                            continue;

                        $request = $metadata['request'];
                        $adapter = new ServiceAdapter($instance,$rm,$metadata);
                        registerService($request,$adapter,$services);
                    }
                }
            }
        }
    }


    function getRequests($content_type, $input)
    {
        if (stripos($content_type, "application/json") !== FALSE)
        {
            return getRequestsFromJSON($input);
        }
        else
        {
            return getRequestsFromXML($input);
        }
    }

    function getRequestsFromXML($input)
    {
        $requests = array();

        $dom = new DOMDocument();
        $dom->loadXML($input);
        $nodes = $dom->documentElement->childNodes;

        foreach ($nodes as $node)
        {
            if ($node->nodeType != XML_ELEMENT_NODE)
            {
                continue;
            }

            // pull out message type and parse JSON body
            $cdata = '';
            foreach ($node->childNodes as $child)
            {
                $cdata = $cdata . $child->nodeValue;
            }

            $request = array();
            $request['type'] = $node->getAttribute('type');
            $request['version'] = $node->getAttribute('version');
            $request['scope'] = $node->getAttribute('scope');
            $request['data'] = json_decode($cdata, true);
            $requests[] = $request; 
        }

        return $requests;
    }

    function getRequestsFromJSON($input)
    {
        $request = json_decode($input, true);
    
        $version = $request['version']; // protocol version
        $timestamp = $request['timestamp'];
        
        $requests = array();
        foreach ($request['messages'] as $smessage)
        {
           $message = array();
           $message['type'] = $smessage['type']; 
           $message['version'] = $smessage['version'];  // service version
           $message['scope'] = $smessage['scope']; 
           $message['data'] = $smessage['data']; 
           $requests[] = $message;
        }

        return $requests;
    }

    function getResponseText($content_type, $responses, $sessionid)
    {
        if (stripos($content_type, "application/json") !== FALSE)
        {
            return getResponseTextAsJSON($responses, $sessionid);
        }
        else
        {
            return getResponseTextAsXML($responses, $sessionid);
        }
    }

    function getResponseTextAsJSON($responses, $sessionid)
    {
        $json = array(
            'version' => '1.0',
            'timestamp' => gmdate('U999') // timestamp in miliseconds
        );
            
        if (!is_null($sessionid))
        {
            $json['sessionid'] = $sessionid;
        }

        $json['messages'] = $responses;
        return json_encode($json);
    }

    function getResponseTextAsXML($responses, $sessionid)
    {
        $dom = new DOMDocument();

        $messages = $dom->createElement('messages');
        $messages->setAttribute('version','1.0');
        if (!is_null($sessionid))
        {
            $messages->setAttribute('sessionid',$sessionid);
        }

        $dom->appendChild($messages);

        foreach ($responses as $response)
        {
            $element = $dom->createElement('message');
            $element->setAttribute('type', $response['type']);
            $element->setAttribute('requestid', '1');
            $element->setAttribute('datatype',  'JSON');
            $cdata = $dom->createCDATASection(json_encode($response['data']));
            $element->appendChild($cdata);
            $messages->appendChild($element);
        }
        
        return $dom->saveXML();
    }
    
    // process each incoming service request
    $requests = getRequests($content_type, $post);
    $responses = array();
    foreach ($requests as $request)
    {

        if (!array_key_exists($request['type'], $services))
        {
            continue;
        }

        foreach ($services[$request['type']] as $handler)
        {
            // version must match for a service to be called
            if ($handler->getVersion() != $request['version'])
            {
                continue;
            }

            // only create a response if the annotation specifies one
            if (is_null($handler->getResponseType()))
            {
                $response = null;
            }
            else
            {
                $response = array();
                $data = array();
                $response['type'] = $handler->getResponseType();
                $response['version'] = $request['version'];
                $response['scope'] = $request['scope'];
                $response['data'] = &$data;
                $responses[] = &$response; // serialize this later
            }

            // dispatch to the service
            $handler->dispatch($request, $response);

        }
    }

    // do le serialization
    $responseText = getResponseText($content_type, $responses, $sessionid);
    
    // return our response based on whether we have responses or not
    if (count($responses) > 0)
    {
        header('Content-type: ' . $content_type);
        print $responseText;
    }
    else
    {
        header('Content-Length: 0');
        header('Content-type: text/plain');
        header('HTTP/1.0 202 Accepted');
    }
?>
