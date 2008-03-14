<?php

class ServicebrokerController extends Zend_Controller_Action {

    private function badRequest($reason) {
            $this->getResponse()->setHeader('Content-Length', '0');
            $this->getResponse()->setHeader('Content-type', 'text/plain');
            $this->getResponse()->setHeader('X-Failure-Reason', $reason);
            $this->getResponse()->setHeader('X-Failed-Retry', '1');
            $this->getResponse()->setHeader('HTTP/1.0', '400 Bad Request');
    }

    private function toXML ($dom, $response)
    {
        $element = $dom->createElement('message');
        $element->setAttribute('type',$response['type']);
        $element->setAttribute('requestid',$response['requestid']);
        $element->setAttribute('datatype','JSON');
        $element->setAttribute('direction','OUTGOING');
        $element->setAttribute('timestamp',time());
        $cdata = $dom->createCDATASection(Zend_Json::encode($response['data']));
        $element->appendChild($cdata);
        return $element;
    }

    public function indexAction() {

        Zend_Loader::loadClass('Zend_Session_Namespace');
        Zend_Loader::loadClass('Zend_Json');
        Zend_Loader::loadClass('Appcelerator_Service');

        $req = $this->getRequest();
        $session = new Zend_Session_Namespace('Appcelerator');
        $sessionid = Zend_Session::getId();

        $my_secret_key = "";
        $shared_secret = is_null($my_secret_key) ? null : md5($my_secret_key);

        /* initialization just starts a session */
        if ($req->getParam("initial") == 1 || $req->getParam("init") == 1) {
            return;
        }

        $auth = $req->getParam("auth");
        $instanceid = $req->getParam("instanceid");
        if (is_null($auth)) {
            $this->badRequest("no instanceid");
            return;
        }

        if (is_null($instanceid)) {
            $this->badRequest("no auth token");
            return;
        }

        if ($auth !== $shared_secret && md5($sessionid . $instanceid) !== $auth) {
            $this->badRequest("invalid auth token");
            return;
        }

        if (!$req->isPost() && !$req->isGet()) {
            $this->getResponse()->setHeader('HTTP/1.0', '405 Bad Request');
            $this->getResponse()->setHeader('Allow', 'GET POST');
            $this->view->content = "Invalid method\n";
            return;
        }

        if ($req->isGet()) {
            $this->getResponse()->setHeader('Content-type', 'text/xml;charset=UTF-8');
            $this->view->content = "<?xml version='1.0' encoding='UTF-8'?>\n";
            $this->view->content .= "<messages version='1.0' sessionid='$sessionid'/>\n";
            return;
        }

        $post = $req->getRawBody();

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

                $request = array();
                $request['scope'] = $node->getAttribute('scope');
                $request['version'] = $node->getAttribute('version');
                $request['data'] = Zend_Json::decode($cdata,true);
                $request['requestid'] = $node->getAttribute('requestid');

                try {
                    $services = Appcelerator_Service::getServices($type);
                } catch (Exception $e) {
                    $this->badRequest($e->getMessage());     
                    return;
                }

                foreach ($services as $handler) {

                    // version mismatch
                    if ($handler->getVersion() != $request['version']) {
                        continue;
                    }

                    // dispatch to the service and get response message (optional)
                    $responseType = $handler->getResponseType();
                    if (is_null($responseType)) {
                        $handler->dispatch($request,null);

                    } else {
                         $data = array();
                         $response = array();
                         $response['scope']=$request['scope'];
                         $response['version']=$request['version'];
                         $response['type']=$responseType;
                         $response['requestid']=$request['requestid'];
                         $response['data']=&$data;
                         $handler->dispatch($request,$response);
                         $element = $this->toXML($responseDom, $response);
                         $responseElement->appendChild($element);
                         $count++;
                    }
                }
            }
        }
        
        //
        // return our response based on whether we have responses or not
        //
        if ($count > 0)
        {
            $this->getResponse()->setHeader('Content-type', 'text/xml;charset=UTF-8');
            $this->view->content = $responseDom->saveXML();
        }
        else
        {
            $this->getResponse()->setHeader('Content-Length', '0');
            $this->getResponse()->setHeader('Content-type', 'text/plain');
            $this->getResponse()->setHeader('HTTP/1.0', '202 Accepted');
        }
 
    }

}

?>
