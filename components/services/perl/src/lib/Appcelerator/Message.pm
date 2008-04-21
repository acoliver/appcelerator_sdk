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

package Appcelerator::Message;
use XML::Simple;
use JSON::Any;
use strict;

sub new {
    my $class = shift;
    my $self = {};

    $self->{"_type"} = shift;
    $self->{"_requestid"} = shift;
    $self->{"_scope"} = shift;
    $self->{"_data"} = shift;
    $self->{"_version"} = shift;

    bless ($self, $class);
    return $self;
}

sub type { my $self = shift; return $self->{"_type"}; }
sub requestid { my $self = shift; return $self->{"_requestid"}; }
sub scope { my $self = shift; return $self->{"_scope"}; }
sub data { my $self = shift; return $self->{"_data"}; }
sub version { my $self = shift; return $self->{"_version"}; }
sub setData{ my $self = shift; $self->{"_data"} = shift; }


sub deserialize {
    my ($class, $contentType, $input) = @_;

    if ($contentType =~ /application\/json/) {
        return Appcelerator::Message->deserializeJSON($input);

    } elsif ($contentType =~ /text\/xml/) {
        return Appcelerator::Message->deserializeXML($input);
    }
}

sub serialize {
    my ($class, $contentType, $input, $sessionid) = @_;

    if ($contentType =~ /application\/json/) {
        return Appcelerator::Message->serializeJSON($input, $sessionid);

    } elsif ($contentType =~ /text\/xml/) {
        return Appcelerator::Message->serializeXML($input, $sessionid);

    } else {
        return ""; # :(
    }
}

sub deserializeJSON {
    my ($class, $input) = @_;
    my $j = JSON::Any->new;

    my $requests = $j->decode($input);
    my $messages = [];

    for my $jsonmessage (@{$requests->{'request'}->{'messages'}}) {
        my $type = $jsonmessage->{'type'};
        my $requestid = $jsonmessage->{'requestid'};
        my $scope = $jsonmessage->{'scope'};
        my $data = $jsonmessage->{'data'};
        my $version = $jsonmessage->{'version'};

        push @{$messages}, Appcelerator::Message->new($type, $requestid, $scope, $data, $version);
    }

    return $messages;
}
sub serializeJSON {
    my ($class, $messages, $sessionid) = @_;
    my $j = JSON::Any->new;
    
    # process all response objects
    my @responses = ();
    for my $message (@{$messages}) {
        my $json_response = {
            'requestid' => $message->requestid(),
            'type' => $message->type(),
            'data' => $message->data(),
            'scope' => $message->scope(),
            'direction' => 'OUTGOING',
            'datatype' => 'JSON'};
        push @responses, $json_response;
    }

    my $envelope = {
        version => '1.0',
        sessionid => $sessionid,
        messages => \@responses
    };

    return $j->encode($envelope);
}

sub deserializeXML {
    my ($class, $input) = @_;

    my $j = JSON::Any->new;

    my $messages = [];
    my $xmlsimple = new XML::Simple(forcearray=>1);
    my $xml = $xmlsimple->XMLin($input);

    foreach my $xmlmessage (@{$xml->{'message'}}) {
        my $requestid = $xmlmessage->{'requestid'};
        my $type = $xmlmessage->{'type'};
        my $scope = $xmlmessage->{'scope'};
        my $version = $xmlmessage->{'version'};
        my $data = $j->decode($xmlmessage->{'content'});

        push @{$messages}, Appcelerator::Message->new($type, $requestid, $scope, $data, $version);
    }

    return $messages;
}
sub serializeXML {
    my ($class, $messages, $sessionid) = @_;
    my $j = JSON::Any->new;

    # process all response objects
    my @responses = ();
    for my $message (@{$messages}) {
        my $data = $j->encode($message->data());

        my $json_response = {
            'requestid' => $message->requestid(),
            'type' => $message->type(),
            'scope' => $message->scope(),
            'content' => $data,
            'direction' => 'OUTGOING',
            'datatype' => 'JSON'};
        push @responses, $json_response;
    }

    my $envelope = {
        version => '1.0',
        sessionid => $sessionid,
        message => \@responses
    };
    

    my $xmlsimple_out = new XML::Simple(KeepRoot=>1,
                                     ForceArray=>1,
                                     RootName=>'messages');
    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" . $xmlsimple_out->XMLout($envelope);
}

1;
