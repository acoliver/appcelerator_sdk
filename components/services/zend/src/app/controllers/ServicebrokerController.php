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
