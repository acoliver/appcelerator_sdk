<?php 
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

    public function dispatch (&$request,&$response) {
        $this->method->invoke($this->instance, $request, $response);
    }

    public static function crawlServices() {
        $directory = dirname(__FILE__) . "/../../app/services";

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
        
            // recursively scan directories
            if (is_dir($path)) {
                $files = Appcelerator_Service::collectFiles($path, $files);
            }

            // service files must be named [^.](.*)Service.php -- no hidden files
            // they might be vim swap files or something similar
            if (strpos($listing, ".") === 0 || !stristr($listing, 'Service')) {
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
    
        if (is_null(Appcelerator_Service::$services)) {
            Appcelerator_Service::$services = array();
            Appcelerator_Service::crawlServices();
        }
        
        if (!array_key_exists($request, Appcelerator_Service::$services)) {
            return array();
        }

        return Appcelerator_Service::$services[$request];
    }

}

?>
