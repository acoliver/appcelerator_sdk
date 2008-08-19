#!/usr/bin/perl
#
# This file is part of Appcelerator.
#
# Copyright (c) 2006-2008, Appcelerator, Inc.
# All rights reserved.
# 
# Redistribution and use in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
# 
#     * Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
# 
#     * Redistributions in binary form must reproduce the above copyright notice,
#       this list of conditions and the following disclaimer in the documentation
#       and/or other materials provided with the distribution.
# 
#     * Neither the name of Appcelerator, Inc. nor the names of its
#       contributors may be used to endorse or promote products derived from this
#       software without specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
