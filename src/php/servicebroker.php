<?php
/**
 *  Appcelerator SDK
 *  Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
 *  For more information, please visit http://www.appcelerator.org
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
	
// change this to something (anything) but what it is now
// you can also set this to null if you don't want server-to-server communication
$my_secret_key = null;
$shared_secret = is_null($my_secret_key) ? null : md5($my_secret_key);

//---------------------------------------------------------------------------------
//
// Everything below here is the core framework and requires no configuration
//
//---------------------------------------------------------------------------------

session_name('PHPSESSID');
session_start();
$sessionid = session_id();

$PARAMS = array_merge($_GET, $_POST);
$method = $_SERVER['REQUEST_METHOD'];
$instanceid = $PARAMS['instanceid'];
$auth = $PARAMS['auth'];
$init = $PARAMS['init'];

if ($init=='1')
{
	// just used to get the session going
	return;
}

$badrequest = false;
$reason = 'unknown';

//
// security check to make sure we're getting requests
// from our client
//
if (is_null($instanceid) || is_null($auth))
{
	$badrequest = true;
	$reason = is_null($instanceid) ? 'no instanceid' : 'no auth token';
}
else if ($auth!==$shared_secret)
{
    $check = md5($sessionid.$instanceid);
	if ($check!==$auth)
	{
		$badrequest = true;
		$reason = 'invalid auth token';
	}
}

if ($badrequest)
{
	header('Content-Length: 0');
	header('Content-type: text/plain');
	header('X-Failure-Reason: ' . $reason);
	header('X-Failed-Retry: 1');
	header('HTTP/1.0 400 Bad Request');
	return;
}

if ($method == 'GET')
{
	/**
	 * NOTE: this function doesn't do anything since PHP doesn't really support asynchronous
	 * behaviour (at least not cross-platform)
	 */
	header('Content-type: text/xml;charset=UTF-8');
	print "<?xml version='1.0' encoding='UTF-8'?>\n";
	print "<messages version='1.0' sessionid='$sessionid'/>\n";
	return;
}
else if ($method != 'POST')
{
	header('HTTP/1.0 405 Method Not Allowed');
	header("Allow: GET POST");
	print "Invalid method\n";
	return;
}

$dir = dirname(__FILE__) . '/services';

if (!is_dir($dir)) 
{
	header('HTTP/1.0 500 Internal Server Error');
	header("X-Failure-Reason: no services directory found on server");
	print "No services directory found\n";
	return;
}

function searchdir ( $path , $maxdepth = -1 , $mode = "FULL" , $d = 0 )
{
	if ( substr ( $path , strlen ( $path ) - 1 ) != '/' ) { $path .= '/' ; }     
	$dirlist = array () ;
	if ( $mode != "FILES" ) { $dirlist[] = $path ; }
	if ( $handle = opendir ( $path ) )
	{
	    while ( false !== ( $file = readdir ( $handle ) ) )
	    {
	        if ( $file != '.' && $file != '..' )
	        {
	            $file = $path . $file ;
	            if ( ! is_dir ( $file ) ) { if ( $mode != "DIRS" ) { $dirlist[] = $file ; } }
	            elseif ( $d >=0 && ($d < $maxdepth || $maxdepth < 0) )
	            {
	                $result = searchdir ( $file . '/' , $maxdepth , $mode , $d + 1 ) ;
	                $dirlist = array_merge ( $dirlist , $result ) ;
	            }
	    }
	    }
	    closedir ( $handle ) ;
	}
	if ( $d == 0 ) { natcasesort ( $dirlist ) ; }
	return ( $dirlist ) ;
}

function getServiceMetadata($str)
{
	$matches = array();
	preg_match("/@Service[\s]*\([\s]*request[\s]*=(.*)?[\s]*[,]{0,1}[\s]*(response[\s]*=[\s]*(.*)?)+[,]{0,1}". "(version[\s]*=[\s]*([0-9]+[.]{0,1}[0-9]*)){0,1}\)/U", $str, $matches);
	$array = array();
	$array['request']=$matches[1];
	$array['response']=isset($matches[3]) ? $matches[3] : '';
	$array['version']=isset($matches[5]) ? $matches[5] : '1.0';
	return $array;
}

$services = array();

function registerService ($type, &$handler, &$handlers)
{
	if (!array_key_exists($type,$handlers))
	{
		$handlers[$type] = array();
	}
	$array = $handlers[$type];
	array_push($array,$handler);
	$handlers[$type]=$array;
}

header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Pragma: no-cache');
header('Cache-control: no-cache, no-store, private, must-revalidate');

$post = file_get_contents("php://input");



// dynamically support either PHP5 or PHP4
$v = phpversion();
if (substr($v,0,1)=='5')
{
   require "servicebroker_5.php";
}
else if (substr($v,0,1)=='4')
{
   require "servicebroker_4.php";
}
else
{
	header('Content-Length: 0');
	header('Content-type: text/plain');
	header('HTTP/1.0 501 PHP version not supported');
}

?>
