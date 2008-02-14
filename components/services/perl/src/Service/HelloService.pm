package Service::HelloService;
use AppceleratorService;
use base 'AppceleratorService';
use strict;

Service("app.test.message.request", "app.test.message.response", *hello);
sub hello {
    my $self = shift;
    my $ptr = shift;
    my $session = shift;
    my $message = shift;

    my %data = %$ptr;
    return (message => "I received from you: $data{'message'}", success =>
"true");
}

1;
