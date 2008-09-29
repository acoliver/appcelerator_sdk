<?php 
/*
 * Copyright 2006-2008 Appcelerator, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */


final class Appcelerator_Request {

    private $request;
    private $contentType = "";
    private $invalidMethod = false;

    private $timestamp;
    private $version;
    private $sessionid;

    private $requests;
    private $responses;

    public function __construct($request, $sessionid) {
        Zend_Loader::loadClass('Zend_Json');
        Zend_Loader::loadClass('Appcelerator_Message');
        Zend_Loader::loadClass('Appcelerator_Service');

        $this->request = $request;
        $this->contentType = $request->getHeader("Content-Type"); 
        $this->sessionid = $sessionid;
        $this->requests = array(); 
        $this->responses = array();
        
        // Only GET and POST are allowed
        if (!$request->isPost() && !$request->isGet()) {
            $this->invalidMethod = true;
            return;
        }

        // GET requests should not contain messages
        if ($request->isGet()) {
            return;
        }

        // POST request, parse pmessages
        if (stripos($this->contentType, "application/json") !== FALSE) {
            $this->decodeJSON($request->getRawBody());
        } else {
            $this->decodeXML($request->getRawBody());
        }
    }
    private function decodeXML($input) {
        $dom = new DOMDocument();
        $dom->loadXML($input);

        $this->timestamp = $dom->documentElement->getAttribute("timestamp");
        $this->version = $dom->documentElement->getAttribute("version");

        $nodes = $dom->documentElement->childNodes;
        foreach ($nodes as $node) {

            if ($node->nodeType != XML_ELEMENT_NODE) { continue; }

            $cdata = '';
            foreach ($node->childNodes as $child)
            {
                $cdata = $cdata . $child->nodeValue;
            }

            $message = new Appcelerator_Message();
            $message->setType($node->getAttribute('type')); 
            $message->setVersion($node->getAttribute('version')); 
            $message->setScope($node->getAttribute('scope')); 
            $message->setData(Zend_Json::decode($cdata,true)); 
            $this->requests[] = $message;
        }
    }
    private function decodeJSON($input) {
        $request = Zend_Json::decode($input, true);
        //$request = $request['request'];

        $this->timestamp = $request['timestamp']; 
        $this->version = $request['version']; 

        $this->message = array(); // we're going to fill this with messages
        foreach ($request['messages'] as $smessage) {
           $message = new Appcelerator_Message();
           $message->setType($smessage['type']); 
           $message->setVersion($smessage['version']); 
           $message->setScope($smessage['scope']); 
           $message->setData($smessage['data']); 
           $this->requests[] = $message;
        }
    }

    public function processMessages() {
        foreach ($this->requests as $request) {
            $services = Appcelerator_Service::getServices($request);

            foreach ($services as $handler) {
                $response = $handler->createResponseMessage($request, $handler);
                $handler->dispatch($request, $response);

                // if there is no response type, the response message
                // will be null and we don't want to send it along
                if (!is_null($response)) {
                    $this->responses[] = $response;
                }
            }

        }
    }

    public function getResponseText() {
        // POST request, parse pmessages
        if (stripos($this->contentType, "application/json") !== FALSE) {
            return $this->getJSONResponse();
        } else {
            return $this->getXMLResponse();
        }
    }
    public function getXMLResponse() {
        $dom = new DOMDocument("1.0", "UTF-8");

        $messagesElement = $dom->createElement('messages');
        $messagesElement->setAttribute('version','1.0');

        //$messagesElement->setAttribute('timestamp', $timestamp);
        //$messagesElement->setAttribute('tz', $this->timezoneOffset);

        if (!is_null($this->sessionid))
        {
            $messagesElement->setAttribute('sessionid',$this->sessionid);
        }
        $dom->appendChild($messagesElement);

        foreach($this->responses as $response) {
            $message = $dom->createElement('message');
            $message->setAttribute('type', $response->getType());
            $message->setAttribute('version', $response->getVersion());
            $message->setAttribute('scope', $response->getScope());

            $message->setAttribute('requestid', "1");
            $message->setAttribute('datatype', "JSON");

            $cdata = $dom->createCDATASection(Zend_Json::encode($response->getData()));
            $message->appendChild($cdata);

            $messagesElement->appendChild($message);
        }

        return $dom->saveXML();
    }

    public function getJSONResponse() {
        $out = array(
           'version' => '1.0',
           'timestamp' => gmdate('U999'),
           'messages' => array()
        );

        if (!is_null($this->sessionid))
        {
            $out['sessionid'] = $this->sessionid;
        }

        foreach($this->responses as $response) {
            $message = array();
            $message['type'] = $response->getType();
            $message['version'] = $response->getVersion();
            $message['scope'] = $response->getScope();
            $message['data'] = $response->getData();
            $out['messages'][] = $message; 
        }

        return Zend_Json::encode($out);
    }

    public function getTimezoneOffset() {
        return $this->timezoneOffset;
    }
    public function getTimestamp() {
        return $this->timestamp;
    }
    public function getContentType() {
        return $this->contentType;
    }
    public function isInvalidMethod() {
        return $this->invalidMethod;
    }
    public function getResponses() {
        return $this->responses;
    }
}
?>
