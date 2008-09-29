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


class ServicebrokerController extends Zend_Controller_Action {

    private function badRequest($reason) {
        $this->getResponse()->setHeader('Content-Length', '0');
        $this->getResponse()->setHeader('Content-type', 'text/plain');
        $this->getResponse()->setHeader('X-Failure-Reason', $reason);
        $this->getResponse()->setHeader('X-Failed-Retry', '1');
        $this->getResponse()->setHeader('HTTP/1.0', '400 Bad Request');
    }

    public function indexAction() {

        Zend_Loader::loadClass('Zend_Session_Namespace');
        Zend_Loader::loadClass('Appcelerator_Request');

        $req = $this->getRequest();
        $session = new Zend_Session_Namespace('Appcelerator');
        $sessionid = Zend_Session::getId();

        $my_secret_key = "";
        $shared_secret = is_null($my_secret_key) ? null : md5($my_secret_key);

        // initialization just starts a session
        if ($req->getParam("initial") == 1 || $req->getParam("init") == 1) {
            return;
        }

        $auth = $req->getParam("auth");
        $instanceid = $req->getParam("instanceid");
        if (is_null($auth)) {
            $this->badRequest("no auth token");
            return;
        }

        if (is_null($instanceid)) {
            $this->badRequest("no instanceid");
            return;
        }

        if ($auth !== $shared_secret && md5($sessionid . $instanceid) !== $auth) {
            $this->badRequest("invalid auth token");
            return;
        }

        $request = new Appcelerator_Request($req, $sessionid);

        // Only GET and POST are allowed
        if ($request->isInvalidMethod()) {
            $this->getResponse()->setHeader('HTTP/1.0', '405 Bad Request');
            $this->getResponse()->setHeader('Allow', 'GET POST');
            $this->view->content = "Invalid method\n";
            return;
        }

        $request->processMessages();

        if (count($request->getResponses()) > 0) {
            $this->getResponse()->setHeader('Content-type', $request->getContentType());
            $this->view->content = $request->getResponseText();

        } else {
            $this->getResponse()->setHeader('Content-Length', '0');
            $this->getResponse()->setHeader('Content-type', 'text/plain');
            $this->getResponse()->setHeader('HTTP/1.0', '202 Accepted');
        }
    }

}

?>
