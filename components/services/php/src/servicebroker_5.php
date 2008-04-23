<?php 
    /**
     * This file is part of Appcelerator.
     *
     * Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
     * For more information, please visit http://www.appcelerator.org 
     *
     * Appcelerator is free software: you can redistribute it and/or modify
     * it under the terms of the GNU General Public License as published by
     * the Free Software Foundation, either version 3 of the License, or
     * (at your option) any later version.
     * 
     * This program is distributed in the hope that it will be useful,
     * but WITHOUT ANY WARRANTY; without even the implied warranty of
     * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     * GNU General Public License for more details.
     * 
     * You should have received a copy of the GNU General Public License
     * along with this program.  If not, see <http://www.gnu.org/licenses/>.
     *
     */

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
            $request['scope'] = $node->getAttribute('scope');
            $request['version'] = $node->getAttribute('version');
            $request['requestid'] = $node->getAttribute('requestid');
            $request['datatype'] = $node->getAttribute('datatype');
            $request['direction'] = "INCOMMING";
            $request['data'] = json_decode($cdata, true);
            $requests[] = $request; 
        }

        return $requests;
    }

    function getRequestsFromJSON($input)
    {
        $request = json_decode($input, true);
        $request = $request['request'];

        $timestamp = $request['timestamp'];
        $tz = $request['tz'];
        
        $requests = array();
        foreach ($request['messages'] as $smessage)
        {
           $message = array();
           $message['type'] = $smessage['type']; 
           $message['scope'] = $smessage['scope']; 
           $message['version'] = $smessage['version']; 
           $message['requestid'] = $smessage['requestid']; 
           $message['datatype'] = $smessage['datatype']; 
           $message['direction'] = "INCOMMING";
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
            'encoding' => 'UTF-8');
            
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
            $element->setAttribute('requestid', $response['requestid']);
            $element->setAttribute('datatype',  $response['datatype']);
            $element->setAttribute('direction', $response['direction']);
            $element->setAttribute('timestamp', $response['timestamp']);
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
                $response['scope'] = $request['scope'];
                $response['version'] = $request['version'];
                $response['type'] = $handler->getResponseType();
                $response['requestid'] = $request['requestid'];
                $response['direction'] = "OUTGOING";
                $response['datatype'] = $request['datatype'];
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
