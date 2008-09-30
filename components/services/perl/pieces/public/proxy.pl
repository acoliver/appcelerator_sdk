#!/usr/bin/perl

# 
# Copyright 2006-2008 Appcelerator, Inc.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#    http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License. 
# 
use strict;
use MIME::Base64;
use WWW::Curl::Easy;
use CGI;

# preserve the post data
my $query = new CGI;
my $postdata = $query->param('POSTDATA');

# CGI.pm does not automatically parse the
# query string for POST requests. :(
$query->parse_params($ENV{'QUERY_STRING'});

# decode url from base64, if necessary
my $url = $query->param("url");
if (!($url =~ m/:\/\//)) {
    $url = decode_base64($url);
}

#my $postdata = $query->param('POSTDATA');
my $postdata = "";

my @headers= (
    "User-Agent: " . $ENV{'HTTP_USER_AGENT'},
    "Content-Length: " . length($postdata)
);

my $curl = WWW::Curl::Easy->new() or die "curl init failed!\n";
$curl->setopt(CURLOPT_URL, $url);
$curl->setopt(CURLOPT_HTTPHEADER, \@headers);
$curl->setopt(CURLOPT_TIMEOUT, 10);
$curl->setopt(CURLOPT_HEADER, 1);

# curl is frustrating
sub write_callback {
    my ($chunk,$context) = @_;
    if ($context) {
        ${$context} = ${$context} . $chunk;
    } else {
        ${$context} = $chunk;
    }
    return length($chunk); # OK
}

$curl->setopt(CURLOPT_WRITEFUNCTION, \&write_callback);
$curl->setopt(CURLOPT_HEADERFUNCTION, \&write_callback);

if (length($postdata) > 0) {
   $curl->setopt(CURLOPT_POSTFIELDS, $postdata); 
}

my $content;
$curl->setopt(CURLOPT_FILE, \$content);

if ($curl->perform() != 0) {
    print "Failed ::" . $curl->errbuf . "\n";
}

my ($header, $body) = split(/\r\n\r\n/, $content, 2);
my ($status, $header) = split (/\n/, $header, 2);

my $line;
foreach $line (split(/\n/, $header)) {
    if (!($line =~ m/Set-Cookie.*/
       || $line =~ m/Transfer-Encoding.*/)) {
        print $line . "\n";
    }    
}
print "\n";
print $body;
