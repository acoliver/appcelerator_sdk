package Service::ContactManagerService
use AppceleratorService;
use base 'AppceleratorService';
use strict;

Service("example.createcontact.request", "example.createcontact.response", *hello);
sub hello {
    my $self = shift;
    return (id => 1001, success => true);
}

1;
