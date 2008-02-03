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
