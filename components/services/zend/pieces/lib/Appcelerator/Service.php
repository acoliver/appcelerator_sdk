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

final class Appcelerator_Service {

    private static $services = null;

    private $instance;
    private $method;
    private $request;
    private $response;
    private $version;

    public function __construct($request, $response, $version, &$instance, &$method) {
        $this->instance = $instance;
        $this->method = $method;

        $this->request = $request;
        $this->response = $response;
        $this->version = $version;

        // register this service
        if (!array_key_exists($request, Appcelerator_Service::$services)) {
            Appcelerator_Service::$services[$request] = array();
        }

        Appcelerator_Service::$services[$request][] = $this; 
    }

    public function getVersion () {
        return $this->version;
    }

    public function getResponseType () {
        return $this->response;
    }

    public function createResponseMessage($request, $service) {

        if (is_null($service->getResponseType())) {
            return null;
        }

        Zend_Loader::loadClass('Appcelerator_Message');
        $response = $request->copy();
        $response->setType($service->getResponseType());
        $response->setData(array());
        return $response; 
    }


    public function dispatch (&$request,&$response) {
        $this->method->invoke($this->instance, $request, $response);
    }

    public static function crawlServices() {
        $directory = dirname(__FILE__) . "/@@services-path@@";

        if (!is_dir($directory)) {
            throw new Exception("no services directory found on server");
        }

        $files = Appcelerator_Service::collectFiles($directory, array());
        
        foreach ($files as $path => $classname) {
            Appcelerator_Service::crawlClass($path, $classname);
        }
    } 

    public static function collectFiles($directory, $files) {
        $listings = scandir($directory);

        foreach ($listings as $listing) {
            $path = "$directory/$listing";
        
            if ($listing == '.' || $listing == '..') {
                continue;
            }
        
            // no hidden files or directories
            if (strpos($listing, ".") === 0) {
                continue;
            }

            // recursively scan directories
            if (is_dir($path)) {
                $files = Appcelerator_Service::collectFiles($path, $files);
            }

            // service files must be named [^.](.+)Service.php
            if (!stristr($listing, 'Service')) {
                continue;
            }

            // this is a valid service source file - record path and file name
            $files[$path] = Appcelerator_Service::fileToClassName($listing);
        }

        return $files;
    }

    public static function crawlClass($path, $classname) {
        require_once $path;
        $instance = new $classname;
        $reflection = new ReflectionClass($classname);

        foreach ($reflection->getMethods() as $method) {

            // these are not service methods
            if ($method->isConstructor()
             || $method->isDestructor()
             || $method->getNumberOfParameters() != 2
             || !$method->isUserDefined()) {
                continue;
            }
            
            Appcelerator_Service::crawlMethod($method, $instance);
        }

    }

    public static function crawlMethod($method, $instance) {
        $comment = $method->getDoccomment();
	    $matches = array();

    	preg_match("/@Service[\s]*"
                    . "\([\s]*request[\s]*=(.*)?[\s]*[,]{0,1}[\s]*"
                    . "(response[\s]*=[\s]*(.*)?)+[,]{0,1}"
                    . "(version[\s]*=[\s]*([0-9]+[.]{0,1}[0-9]*)){0,1}\)/U",
                     $comment, $matches);
    
        // don't register methods without valid service annotations
        if (count($matches) == 0)
            return;

        $request = $matches[1];
	    $response = isset($matches[3]) ? $matches[3] : '';
	    $version = isset($matches[5]) ? $matches[5] : '1.0';

        new Appcelerator_Service($request, $response, $version, $instance, $method);
    }



    public static function fileToClassName($filename) {
        $tokens = split('_', $filename);
	    $classname = '';
		foreach ($tokens as $t => $token) {
			$classname = $classname . strtoupper(substr($token,0,1)) . substr($token,1);
		}

        return str_ireplace(".php", "", $classname);
    
    }

    public static function getServices($request) {
        $services = array();

        if (is_null(Appcelerator_Service::$services)) {
            Appcelerator_Service::$services = array();
            Appcelerator_Service::crawlServices();
        }
        
        if (!array_key_exists($request->getType(), Appcelerator_Service::$services)) {
            return $services;
        }

        foreach(Appcelerator_Service::$services[$request->getType()] as $service) {
            if (is_null($service->getVersion())
             || is_null($request->getVersion())
             || strcmp($request->getVersion(), $service->getVersion()) == 0) {
                $services[] = $service;
            }
        }

        return $services;
    }

}

?>
