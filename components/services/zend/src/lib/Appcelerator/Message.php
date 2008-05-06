<?php

final class Appcelerator_Message {
    private $type;
    private $version;
    private $scope;
    public $data;

    public function __construct() { } 

    public function copy() {
        $copy = new Appcelerator_Message();
        $copy->setType($this->getType());
        $copy->setVersion($this->getVersion());
        $copy->setScope($this->getScope());
        $copy->setData(array($this->getData()));
        return $copy;
    }


    public function getType() { return $this->type; } 
    public function getVersion() { return $this->version; } 
    public function getScope() { return $this->scope; }
    public function getData() { return $this->data; } 

    public function setType($x) { $this->type = $x; } 
    public function setVersion($x) { $this->version = $x; } 
    public function setScope($x) { $this->scope = $x; } 
    public function setData($x) { $this->data = $x; } 
}

?>
