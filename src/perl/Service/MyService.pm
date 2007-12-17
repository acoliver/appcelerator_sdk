package Service::MyService;
use AppceleratorService;
use base 'AppceleratorService';
use strict;

Service("getprogress", "progress", *handle_myreq);
sub handle_myreq {
    my $self = shift;
    return (value => 20);
}

Service("getprogress2", "progress", *handle_myreq2);
sub handle_myreq2 {
    my $self = shift;
    return (value => 80);
}

1;
