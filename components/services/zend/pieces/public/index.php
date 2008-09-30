<?php

//error_reporting(E_ALL|E_STRICT);
//error_reporting(E_ALL);
//ini_set('display_errors', 'on');
ini_set('display_errors', 'off');

ini_set('include_path', ini_get('include_path') . PATH_SEPARATOR . '@@lib-path@@');
require_once "Zend/Loader.php";

Zend_Loader::loadClass('Zend_Controller_Front');

$front = Zend_Controller_Front::getInstance();
$front->SetControllerDirectory('@@controller-path@@');
$front->throwExceptions(true);

$front->dispatch();

?>
