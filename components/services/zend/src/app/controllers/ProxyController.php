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
class ProxyController extends Zend_Controller_Action {


    public function indexAction() {
        Zend_Loader::loadClass('Zend_Http_Client');


        $req = $this->getRequest();
        
        // only decode the url if seems to be encoded
        $url = $req->getParam("url");
        if (stristr($url, "://") === FALSE) {
            $url = base64_decode($url);
        }
        $req_body = $req->getRawBody();

        $client = new Zend_Http_Client($url);

        $headers = array();
        $headers["User-Agent"] = $req->getHeader("User-Agent");
        $headers["Content-Length"] = strlen($req_body);
        if (!is_null($req->getHeader("Content-Type"))) {
            $headers["Content-Type"] = $req->getHeader("Content-Type");
        }
        $client->setHeaders($headers);

        $response = $client->request();

       foreach($response->getHeaders() as $header => $value) {

            // don't set cookies from the remote host, also
            // transfer and content encodings won't apply to our message
            if (stristr($header, "Set-Cookie") == TRUE
                 || stristr($header, "Transfer-Encoding") == TRUE
                 || stristr($header, "Content-encoding") == TRUE) {
                continue;
            }
            $this->getResponse()->setHeader($header, $value);

        }
        
        $this->view->content = $response->getBody();

    }

}

?>
