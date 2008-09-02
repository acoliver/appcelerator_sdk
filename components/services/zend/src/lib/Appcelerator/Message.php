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
