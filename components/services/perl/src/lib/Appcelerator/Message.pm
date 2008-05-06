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
use Time::Local;
use strict;

sub new {
    my $class = shift;
    my $self = {};

    $self->{"_type"} = shift;
    $self->{"_version"} = shift;
    $self->{"_scope"} = shift;
    $self->{"_data"} = shift;
    $self->{"_timestamp"} = shift;

    bless ($self, $class);
    return $self;
}

sub type { my $self = shift; return $self->{"_type"}; }
sub version { my $self = shift; return $self->{"_version"}; }
sub scope { my $self = shift; return $self->{"_scope"}; }
sub data { my $self = shift; return $self->{"_data"}; }
sub timestamp { my $self = shift; return $self->{"_timestamp"}; }
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
    my $pversion = $requests->{'version'}; # protocol version
    my $timestamp = $requests->{'timestamp'};

    my $messages = [];
    for my $jsonmessage (@{$requests->{'messages'}}) {
        my $type = $jsonmessage->{'type'};
        my $version = $jsonmessage->{'version'}; # message version
        my $scope = $jsonmessage->{'scope'};
        my $data = $jsonmessage->{'data'};

        push @{$messages}, Appcelerator::Message->new($type, $version, $scope, $data, $timestamp);
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
            'type' => $message->type(),
            'version' => $message->version(),
            'scope' => $message->scope(),
            'data' => $message->data(),
        };
        push @responses, $json_response;
    }

    my $envelope = {
        'version' => '1.0',
        'sessionid' => $sessionid,
        'timestamp' => timelocal(gmtime()) * 1000,
        'messages' => \@responses,
    };

    return $j->encode($envelope);
}

sub deserializeXML {
    my ($class, $input) = @_;

    my $j = JSON::Any->new;

    my $messages = [];
    my $xmlsimple = new XML::Simple(forcearray=>1);
    my $xml = $xmlsimple->XMLin($input);
    my $timestamp = $xml->{'timestamp'};

    foreach my $xmlmessage (@{$xml->{'message'}}) {
        my $type = $xmlmessage->{'type'};
        my $version = $xmlmessage->{'version'};
        my $scope = $xmlmessage->{'scope'};
        my $data = $j->decode($xmlmessage->{'content'});

        push @{$messages}, Appcelerator::Message->new($type, $version, $scope, $data, $timestamp);
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
            'requestid' => "1", # no longer used
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
