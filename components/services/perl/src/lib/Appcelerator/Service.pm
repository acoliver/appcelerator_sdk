
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
package Appcelerator::Service;
use strict;
use FindBin qw($Bin);
use File::Spec::Functions qw(catfile splitpath);
use Data::Dumper;

use base 'Exporter';
our @EXPORT = ('Service');
our %handlers = ();

# load all service handlers
my $search_path = catfile("$Bin", "..", "app", "Services", "*.pm");
for my $service (glob($search_path)) {
    $_, $_, $service = splitpath($service);
    $service =~ s/\.[^.]*$//;
    eval("use Services::$service");
}


sub new {
    my $class = shift;
    my $self = {};

    $self->{"_request"} = shift;
    $self->{"_response"} = shift;
    $self->{"_handler"} = shift;
    $self->{"_version"} = shift;

    bless ($self, $class);
    return $self;
}

sub request_type { my $self = shift; return $self->{"_request"}; }
sub response_type { my $self = shift; return $self->{"_response"}; }
sub version { my $self = shift; return $self->{"_version"}; }
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
	my $message = shift;
    my $type = $message->type();
    my $version = $message->version();
 
    my @to_ret = ();
	if (not defined $handlers{$message->type()}) {
		return ();
	}

    for my $service (@{$handlers{$type}}) {
        if (not defined $service-version() or not($service->version()) or $service->version eq $version) {
            push @to_ret, $service;
        }
    }

	return @to_ret;
}


## Called statically to make this class aware
## of a service method
sub Service {
    my ($request, $response, $method, $version) = @_;

	my $package = *{$method}{PACKAGE};
	my $name = *{$method}{NAME};

	my $my_handler;
	eval ("use $package;");
	eval ('$my_handler = new ' . "$package(\"$request\", \"$response\", \"$name\", \"$version\");");
	Appcelerator::Service::add_handler($request, $my_handler);
}

1;
