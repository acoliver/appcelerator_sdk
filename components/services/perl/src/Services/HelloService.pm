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

package Services::HelloService;
use Appcelerator::Service;
use base 'Appcelerator::Service';
use strict;

Service("app.test.message.request", "app.test.message.response", *hello);
sub hello { 
    my $self = shift;
    my $args = shift;

    my $request = $args->{'-request'};
    my $response = $args->{'-response'};
    my $session = $args->{'-session'};

    my $message = $request->data()->{'message'};
    $response->data()->{'message'} = "I received from you: $message";
    $response->data()->{'success'} = "true";
}

1;