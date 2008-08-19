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

# we will need to load modules from the
# parent directory -- outside of apache
# docroot
use File::Spec;
BEGIN {
    push @INC, File::Spec->catfile("..", "app");
    push @INC, File::Spec->catfile("..", "lib");
}

use strict;
use CGI;

use Digest::MD5 qw(md5_hex);
use Apache::Session::File;
use Data::Dumper;
use Appcelerator::Service;
use Appcelerator::Message;

my $shared_secret = "";
my $tmpdir = "/tmp/";
my $lockdir = "/var/lock/";
my $query = new CGI;
my %session;

# preserve the post data
my $postdata = $query->param('POSTDATA');
my $content_type = $ENV{'CONTENT_TYPE'};

# CGI.pm does not automatically parse the
# query string for POST requests. :(
$query->parse_params($ENV{'QUERY_STRING'});

# start a session 
my ($sessionid, $cookie) = start_session();

# get request parameters
my $method = $ENV{'REQUEST_METHOD'};
my $instance_id = $query->param("instanceid");
my $auth = $query->param("auth");
my $init = $query->param("initial");

my %header = ();
my $response = "";
if (defined $cookie) { $header{"-cookie"} = $cookie; }

if ($init eq "1") {
    # just initializing session, do nothing
    # except paste some ascii art
    #        .---.        .-----------
    #       /     \  __  /    ------
    #      / /     \(  )/    -----
    #     //////   ' \/ `   ---
    #    //// / // :    : ---
    #   // /   /  /`    '--
    #  //          //..\\
    #=============UU====UU====
    #             '//||\\`

} elsif (bad_request($instance_id, $auth, $shared_secret, $sessionid)) {
    $header{'-type'} = "text/plain";
    $header{'-status'} = "400 Bad Request";
    $response .= "Invalid request\n";

} elsif ($method eq "GET") { # GET not supported, return no messages
    $header{'-type'} = "text/xml; charset=utf-8";
    my $responses = [];
    $response .= Appcelerator::Message->serialize($content_type, $responses);

} elsif ($method ne "POST") {
    $header{'-type'} = "text/plain";
    $header{'-status'} = "400 Bad Request";
    $response .= "Invalid method\n";

} else {
    $header{'-type'} = $content_type;
    $header{'-Pragma'} = "no-cache";
    $header{'-Expires'} = "now";
    $header{'-Cache-control'} = "no-cache, no-store, private, must-revalidate";

    my $messages = Appcelerator::Message->deserialize($content_type, $postdata);
    my $responses = get_responses($messages, $sessionid);
    $response .= Appcelerator::Message->serialize($content_type, $responses, $sessionid);
}

print $query->header(%header);
print $response;

sub get_responses {
    my $requests = shift;
    my $sessionid = shift;

    my $responses = [];
    foreach my $request (@{$requests}) {

        my @handlers = Appcelerator::Service::get_handlers($request);
        LISTENER: for my $service (@handlers) {

            my $type = $service->response_type();
            my $version = $request->version();
            my $scope = $request->scope();
            my $response = new Appcelerator::Message($type, $version, $scope, {});

            $service->execute({-request => $request,
                              -response => $response,
                              -session => \%session});

            push @{$responses}, $response;
        }
    }

    return $responses;
}

sub start_session {
    my @to_ret;

    my $id = $query->cookie("app_session_id");
    
    eval {
        tie %session, 'Apache::Session::File', $id, {
            Directory => $tmpdir,
            LockDirectory => $lockdir,
        };
    };

    if ($@ and $@ =~ m#^Object does not exist in the data store#) {
        tie %session, 'Apache::Session::File', undef, {
            Directory => $tmpdir,
            LockDirectory => $lockdir,
        };
    }

    $cookie = $query->cookie(
        -name => "app_session_id",
        -value => $session{_session_id},
        -expires => '+30m');

    $to_ret[0] = $session{_session_id}; 
    $to_ret[1] = $cookie;   
    return @to_ret;
}

sub bad_request() {
    my $instance_id = shift;
    my $auth = shift;
    my $shared_secret = shift;
    my $sessionid = shift;

    if ( (not defined $instance_id) or (not defined $auth) ) {
        return 1;
    }

    if ($auth ne $shared_secret) {
        if (md5_hex($sessionid.$instance_id) ne $auth) {
            return 1;
        }
    }

    return 0;

}
