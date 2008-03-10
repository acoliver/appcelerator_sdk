#!/usr/bin/perl

# we will need to load modules from the
# parent directory -- outside of apache
# docroot
BEGIN {
    push @INC, "..";
}

use CGI;
use Digest::MD5 qw(md5);
use Apache::Session::File;
use XML::Simple;
use JSON::Any;
use Data::Dumper;
use AppceleratorService;

$shared_secret = "";
$tmpdir = "/tmp/";
$lockdir = "/var/lock/";
$query = new CGI;

# preserve the post data
my $postdata = $query->param('POSTDATA');

# CGI.pm does not automatically parse the
# query string for POST requests. :(
$query->parse_params($ENV{'QUERY_STRING'});

# start a session 
($sessionid, $cookie) = start_session();

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

} elsif ($method eq "GET") {
    $header{'-type'} = "text/xml; charset=utf-8";
    $response .= "<?xml version='1.0' encoding='UTF-8'?>\n";
    $response .= "<messages version='1.0' sessionid='$sessionid'/>\n";

} elsif ($method ne "POST") {
    $header{'-type'} = "text/plain";
    $header{'-status'} = "400 Bad Request";
    $response .= "Invalid method\n";

} else {
    $header{'-type'} = "text/xml; charset=utf-8";
    $header{'-Pragma'} = "no-cache";
    $header{'-Expires'} = "now";
    $header{'-Cache-control'} = "no-cache, no-store, private, must-revalidate";
    $response .= get_responses($postdata, $sessionid);
}

print $query->header(%header);
print $response;

sub get_responses {
    my $xml = shift;
    my $sessionid = shift;

    my $xmlsimple = new XML::Simple(forcearray=>1);
    my $in = $xmlsimple->XMLin($xml);
    
    my @responses = ();
    foreach my $message (@{$in->{'message'}}) {
        push @responses, @{handle_request($message)};
    }

    my $out_arr = {
        version => '1.0',
        sessionid => $sessionid,
        message => \@responses
    };
    
    my $xmlsimple_out = new XML::Simple(KeepRoot=>1,
                                     ForceArray=>1,
                                     RootName=>'messages' );
    my $out = $xmlsimple_out->XMLout($out_arr);

    return $out;
}

sub handle_request {
    my $message = $_[0];
    my $responses = ();
    my $j = JSON::Any->new;

    # Some other parameter we may want to use later...
    my %tresponse = ();
    $tresponse{'requestid'} = $message->{'requestid'};
    $tresponse{'direction'} = 'OUTGOING';
    $tresponse{'datatype'} = 'JSON';

    # $message->{'scope'};
    # $message->{'version'};
    # $message->{'type'};
    # $message->{'requestid'};

    my $type = $message->{'type'};
    my $payload = $j->decode($message->{'content'});

    my @handlers = AppceleratorService::get_handlers($type);
    LISTENER: for my $listener (@handlers) {

        # get an associative array representing or json message payload
        my %result = $listener->execute($payload, $session, $type);

        # check for no response 
        if (not defined $listener->response_type()) {
            next LISTENER;
        }

        # make the response
        my %response = %tresponse; # copy the template response
        if (not defined %result) { %result = (); }
        $response{'content'} = $j->encode(\%result);
        $response{'type'} = $listener->response_type();

        push @$responses, \%response;
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

    if ( (not defined $instance_id) || (not defined $auth) ) {
        return 1;
    }

    if ($auth ne $shared_secret) {
        if (md5($sessionid.$instanceid) ne $auth) {
            return 1;
        }
    }

    return 0;

}
