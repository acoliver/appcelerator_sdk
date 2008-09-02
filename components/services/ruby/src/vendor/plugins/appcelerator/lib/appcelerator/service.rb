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


class Array
  alias :previous_all? :all?
  def all? &pred
    if pred and pred.class.to_s == 'Proc'
      each do |e|
        if not pred.call(e)
          return false
        end
      end
      return true
    end
    previous_all?
  end
end  

module Appcelerator  
  class Service
    include Singleton
    
    # registration point of standard services
    def Service.Service(messagetype,handler,responsetype = nil)
      self.instance.register(messagetype,handler,responsetype)
    end

    # registration point for service handler filters for authentication, etc 
    def Service.before_filter(filter)
      self.instance.before_filters << filter
    end
    
    # registration point for post-service-handling filters
    def Service.after_filter(filter)
      self.instance.after_filters << filter
    end

    # for use by message handlers    
    attr_accessor :request,:params,:session,:message_type,:response,:response_type,:controller,:logger

     # call this method from a before filter to prevent the remain handlers from running
    def respond_with(response,response_type=nil)
      @response = response
      if response_type
        @response_type = response_type
      end
    end

    # internal
    attr_accessor :before_filters, :after_filters
    
    def initialize
      @listeners = []
      @before_filters = []
      @after_filters = []
      @registrations = []
    end
    
    def clear_listeners
      num_cleared = @listeners.length
      @listeners.each do |listener|
        ServiceBroker.unregister_listener(listener.msgtype, listener)
      end
      @listeners.clear
      num_cleared
    end
    
    def do_before_filters      
      @before_filters.each do |filter|
        method(filter).call()
        break if @response
      end
    end
   
    def do_after_filters
      @after_filters.each do |filter|
          method(filter).call()
      end
    end
    
    # handle a message
    def handle(msg, method_name, response_type)
      @request = msg.request
      @session = msg.session
      @message_type = msg.message_type
      @params = msg.params
      @controller = msg.controller
      @logger = @controller.logger
      @response = nil # this is the handler's response, not the request/response pair
      @response_type = response_type
      
      do_before_filters()
      
      # any response added by the before_filters prevents the handler from running
      if not @response
        @response = method(method_name).call()
        
        do_after_filters()
      end
      
      if @response_type
        msg.response_type = @response_type
        msg.response = @response || {}
      end
      msg
    end
    
	  def register(message_type, method_name, response_type = nil)
      # adding to the ServiceProc binding, for preventing dups # this need may have been removed by properly reloading
      service_name = self.class.name
        
		  proc = ServiceProc.new do |msg|
        # is this const_get stuff important?
        instance = Object.const_get(service_name).instance
        instance.handle(msg,method_name,response_type)
      end
      
      @registrations << method_name.to_s
      
		  ServiceBroker.register_listener(message_type, proc)
      proc
	  end
	  
	  def autoload_services
	    re = Regexp.new "#{self.class.name}#"
      cn = self.class.name.underscore.gsub('_service','')

	    self.public_methods.each do |m|
	      next if @registrations.include? m
	      meth = method(m)
	      next if meth.arity > 0
	      next if m =~ /\?$/
	      methstr = meth.to_s
	      next unless methstr =~ re
	      name = "#{cn}.#{m.underscore.gsub('_','.')}"
	      self.register "#{name}.request", m, "#{name}.response"
      end
      
	    @registrations = nil
    end
        
    private
    
    def Service.load_controller(controller,service_name)
      load_target_methods(controller,'controller') do |message_type,method_name,method,response_type|
        proc = ServiceProc.new do |msg|
          c = controller.new
          new_req = msg.request.clone
          new_resp = msg.response.clone
          new_req.parameters = msg.params.clone
          c.assign_shortcuts(new_req,new_resp)
          c.method(method_name).call
        end
        ServiceBroker.register_listener(message_type, proc)
      end
    end
    
    def Service.load_target_methods(obj,type,registrations=nil)
	    re = Regexp.new "#{obj.name}#"
      cn = obj.name.underscore.gsub("_#{type}",'')
	    obj.public_methods.each do |m|
	      next if registrations and registrations.include? m
	      meth = obj.method(m)
	      next if meth.arity > 0
	      next if m =~ /\?$/
	      next if m =~ /^to_/
	      methstr = meth.to_s
	      next unless methstr =~ re
	      name = "#{cn}.#{m.underscore.gsub('_','.')}"
	      yield "#{name}.request", m, "#{name}.response"
      end
    end
	  
	end
  
    
  #
  # Class to allow inspection and equality checking (for adding to sets)
  # TODO: remove the to_s in eql? and hash when the singleton issue is resolved 
  #
  class ServiceProc < Proc
    def self.vars
        [:message_type, :service_name, :method_name, :response_type]
    end
    
    def method_missing name
        eval(name.to_s, self.binding)
    end
    
    def respond_to?(symbol, include_private = false)
      vars.includes?(symbol)
    end
    
    def to_s
      begin
        service = Object.const_get(service_name).instance
        "#{message_type} -> #{service.before_filters} #{service_name}.#{method_name} #{service.after_filters} -> #{response_type}"
      rescue
        "#{message_type} -> #{service_name}"
      end
    end
    
    def eql?(other)
      self.class.vars.all? do |var|
        self.send(var).to_s == other.send(var).to_s
      end
    end
    alias :== :eql?
    
    def hash
      val = 1
      self.class.vars.each do |var|
        val << 4
        val += self.send(var).to_s.hash
      end
      val
    end
  end

  # helper method
end
