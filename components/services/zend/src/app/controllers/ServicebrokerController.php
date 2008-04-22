<?php

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
