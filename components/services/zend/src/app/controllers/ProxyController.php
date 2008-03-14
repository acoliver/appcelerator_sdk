<?php

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
