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
