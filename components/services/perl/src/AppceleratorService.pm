# This file is part of Appcelerator.
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org 
#
# Appcelerator is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

package AppceleratorService;
use strict;
use FindBin qw($Bin);
use File::Spec::Functions qw(catfile);

use base 'Exporter';
our @EXPORT = ('Service');
our %handlers = ();

# load all service handlers
my $search_path = catfile("$Bin", "..", "Service", "*");
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
