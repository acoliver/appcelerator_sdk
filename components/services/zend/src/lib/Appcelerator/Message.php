<?php

final class Appcelerator_Message {
    private $sessionid;
    private $requestid;
    private $instanceid;
    private $type;
    public $data;
    private $direction;
    private $datatype;
    private $timestamp;
    private $sendTimestamp;
    private $timezoneOffset;
    private $scope;
    private $version;

    public function __construct() { } 

    public function copy() {
        $copy = new Appcelerator_Message();
        $copy->setType($this->getType());
        $copy->setScope($this->getScope());
        $copy->setVersion($this->getVersion());
        $copy->setRequestid($this->getRequestid());
        $copy->setInstanceid($this->getInstanceid());
        $copy->setDataType($this->getDataType());
        $copy->setVersion($this->getVersion());
        $copy->setDirection($this->getDirection());
        $copy->setTimestamp($this->getTimestamp());
        $copy->setTimezoneOffset($this->getTimezoneOffset());
        $copy->setData(array($this->getData()));
        return $copy;
    }


    public function getSessionid() { return $this->sessionid; } 
    public function getRequestid() { return $this->requestid; } 
    public function getInstanceid() { return $this->instanceid; } 
    public function getType() { return $this->type; } 
    public function getData() { return $this->data; } 
    public function getDirection() { return $this->direction; } 
    public function getDatatype() { return $this->datatype; } 
    public function getTimestamp() { return $this->timestamp; } 
    public function getSendTimestamp() { return $this->sendTimestamp; } 
    public function getTimezoneOffset() { return $this->timezoneOffset; } 
    public function getScope() { return $this->scope; } 
    public function getVersion() { return $this->version; } 
    public function setSessionid($x) { $this->sessionid = $x; } 
    public function setRequestid($x) { $this->requestid = $x; } 
    public function setInstanceid($x) { $this->instanceid = $x; } 
    public function setType($x) { $this->type = $x; } 
    public function setData($x) { $this->data = $x; } 
    public function setDirection($x) { $this->direction = $x; } 
    public function setDatatype($x) { $this->datatype = $x; } 
    public function setTimestamp($x) { $this->timestamp = $x; } 
    public function setSendTimestamp($x) { $this->sendTimestamp = $x; } 
    public function setTimezoneOffset($x) { $this->timezoneOffset = $x; } 
    public function setScope($x) { $this->scope = $x; } 
    public function setVersion($x) { $this->version = $x; } 
}

?>
