package AppceleratorService;
use strict;
use FindBin qw($Bin);
use File::Spec::Functions qw(catfile);

use base 'Exporter';
our @EXPORT = ('Service');
our %handlers = ();

# load all service handlers
my $search_path = catfile("$Bin", "Service", "*");
for my $service (glob($search_path)) {
    $service =~ s/\.[^.]*$//;
    $service =~ s/.*\///g;
    eval("use Service::$service");
}

sub new {
    my $class = shift;
    my $self = {};

    $self->{"_request"} = shift;
    $self->{"_response"} = shift;
    $self->{"_handler"} = shift;

    bless ($self, $class);
    return $self;
}

sub request_type { my $self = shift; return $self->{"_request"}; }
sub response_type { my $self = shift; return $self->{"_response"}; }
sub execute { 
    my $self = shift; 
    my $handler = $self->{"_handler"};
    eval ('$self->' . $handler . '(@_);');
}
sub add_handler {
	my $request = shift;
	my $handler = shift;

	if (not defined $handlers{$request}) {
		$handlers{$request} = [];
	}

	push @{$handlers{$request}}, $handler;
}

sub get_handlers {
	my $request = shift;
	
	if (not defined $handlers{$request}) {
		return ();
	}

	return @{$handlers{$request}};
}


## Called statically to make this class aware
## of a service method
sub Service {
    my $request = shift;
    my $response = shift;
    my $method = shift;

	my $package = *{$method}{PACKAGE};
	my $name = *{$method}{NAME};

	my $my_handler;
	eval ("use $package;");
	eval ('$my_handler = new ' . "$package(\"$request\", \"$response\", \"$name\");");
	AppceleratorService::add_handler($request, $my_handler);
}

1;
