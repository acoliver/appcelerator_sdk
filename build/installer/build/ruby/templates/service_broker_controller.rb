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
#
require 'rubygems'
gem 'appcelerator'
require 'appcelerator'

class ServiceBrokerController < ApplicationController
  include ServiceBroker

  if RAILS_GEM_VERSION.to_f >= 2.0
      skip_before_filter :verify_authenticity_token
  end
  
  
  #
  # this is generated automatically when the project was created
  # and contains a random, globally unique id which serves as a 
  # secret key only known by this application and used to create
  # the authorization token in the service broker - you can change
  # this value, but make sure you know why and what you're doing
  #
  def ServiceBrokerController.secret_auth_key
    '<%= secret_auth_key %>'
  end
end
