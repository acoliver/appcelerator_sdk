

module Appcelerator
	class Service
	  include Singleton
    	      
    def Service.Service(messagetype,handler,responsetype)
      self.instance.preregister(messagetype,handler,responsetype)
    end
    
    def Service.service_scaffold(model)
      servicename = model_name(model)
      self.instance.model_class = eval(model.to_s.camelize)
      %w(create retrieve update delete list assembly search).each do |operation|
          messagetype = "app."+ servicename +"."+ operation
          request = messagetype + ".request"
          response = messagetype + ".response"
          self.instance.preregister(request,operation,response)
          APP_SERVICES << {'name'=>name, 'model'=>servicename}
      end
    end
    
    #
    # The following methods are usable by services that call the "service_scaffold" method
    #  to provide CRUD (and more) operations on a single model object.
    #
			def assembly(request,message)
			  if self.respond_to?(:before_assembly)
				  request,message = send(:before_assembly,request,message)
			  end
			  data = Array.new
			  @model_class.columns.each do |column|
			  	  data << {'name'=>column.name,'type'=>column.type, 'limit'=>column.limit, 
			  	  		   'nullable'=>column.null, 'primary'=>column.primary, 
			  	  		   'default'=>column.default}
			  end
			  response = {'success'=>true,'columns'=>data}
			  if self.respond_to?(:after_assembly)
				  response = send(:after_assembly,response)
			  end
			  response
			end
			
			def create(request,message)
			  if self.respond_to?(:before_create)
				  request,message = send(:before_create,request,message)
			  end
			  o = @model_class.new(message)
			  o.save
			  response = {'success'=>true,'id'=>o.id}
			  if self.respond_to?(:after_create)
				  response = send(:after_create,response)
			  end
			  response
			end
			
			def retrieve(request,message)
			  if self.respond_to?(:before_retrieve)
				request,message = send(:before_retrieve,request,message)
			  end
			  o = @model_class.find(message['id'])
			  response = {'success'=>true}
			  o.attributes.each do |key,val|
				  response[key]=val
			  end
			  response
			  if self.respond_to?(:after_retrieve)
				  response = send(:after_retrieve,response)
			  end
			  response
			end
			
			def update(request,message)
			  if self.respond_to?(:before_update)
				request,message = send(:before_update,request,message)
			  end
			  o = @model_class.find(message['id'])
			  return {'success'=>false,'message'=>'record does not exist'} unless o
			  message.each do |key,value|
				if o.attributes.has_key?(key)
				  o[key]=true if value=='true'
				  o[key]=false if value=='false'
				  o[key]=value if o[key]!=true && o[key]!=false
				end
			  end
			  o.save!
			  response = {'success'=>true,'id'=>o.id}
			  if self.respond_to?(:after_update)
				  response = send(:after_update,response)
			  end
			  response
			end
			
			def delete(request,message)
			  if self.respond_to?(:before_delete)
				request,message = send(:before_delete,request,message)
			  end
			  @model_class.delete(message['id'])
			  response = {'success'=>true,'id'=>message['id']}
			  if self.respond_to?(:after_delete)
				  response = send(:after_delete,response)
			  end
			  response
			end
			
			def search(request,message)
  			  if self.respond_to?(:before_search)
  				request,message = send(:before_search,request,message)
  			  end
			    query = '%%' + message['query'] + '%%'
			    conditions_str = Array.new
			    @model_class.content_columns.each do |col|
			      name = col.name + ' like ?'
			      conditions_str << name if col.type == :string
		      end
		      
		      conditions = Array.new
		      conditions << conditions_str.join(' OR ')
		      conditions_str.length.times {|e| conditions<<query}
		      		      
		      results = @model_class.find(:all,:conditions=>conditions)
		      response = {'success'=>true, 'rows'=>results, 'total'=>@model_class.count, 'count'=>results.length}
  			  
  			  if self.respond_to?(:after_search)
  				  response = send(:after_search,response)
  			  end
  			  response
		  end
			
			def list(request,message)
			  pk = message['id']
			  limit = message['limit'] || 100
			  if pk
  			    objs = [@model_class.find_by_id(pk)]
		      else
  			    objs = @model_class.find(:all,:limit=>limit)
	      	  end
			  response = {'success'=>true,'rows'=>objs, 'total'=>@model_class.count}
			  if self.respond_to?(:after_list)
				  response = send(:after_list,response)
			  end
			  response
			end
	  

    def self.load_services
      APP_SERVICES.clear
      # TODO: remove this and solve the multiple singleton issue
      Appcelerator::MessageBroker.clear_listeners
      Dir[RAILS_ROOT + '/app/services/*_service.rb'].each do |file|
        
        name = Inflector.camelize(File.basename(file).chomp('_service.rb')) + 'Service'
        
        if Dependencies.load?
          if defined?(name)
            klass = eval(name)
            # clear the service class's existing listeners, if possible
            klass.instance.clear_listeners
          end
          load file
        else
          require file[0..-4]
        end
        
        begin
          klass = eval(name)
          klass.instance.register_listeners
        rescue
          puts 'Unable to find class "'+ name +'" in file "'+ file +'"'
          puts $!
        end
      end
      puts 'done loading services'
      puts Appcelerator::MessageBroker.diagnostics
    end

    def initialize
      @listeners = []
      @preregistrations = []
    end

    def preregister(*args)
      @preregistrations << args
    end
    
    def register_listeners
      # call after class-load when all methods are defined
      @listeners = @preregistrations.map do |reg|
        register(*reg)
      end
      @preregistrations.clear
      @listeners.length
    end
    
    def clear_listeners
      num_cleared = @listeners.length
      @listeners.each do |listener|
        MessageBroker.unregister_listener(listener.msgtype, listener)
      end
      @listeners.clear
      num_cleared
    end
    
	  def register(msgtype,methodname,responsetype = nil)
      service = self.class # add to the ServiceProc binding
		  handler = self.method(methodname)
		  args = handler.arity
		  proc = ServiceProc.new do |req,msgtype,obj|
		   
		   #
		   # try and be smart about sending in the request to the
		   # service based on the arguments he supports
		   # 
		   case args
		   	when 2
		   		resp = handler.call(req,obj)
		    when 3
		    	resp = handler.call(req,obj,req['session'])
		    when 4
		    	resp = handler.call(req,obj,req['session'],req['session']['username'])
		   end
		   
		   if responsetype
			  Dispatcher.instance.outgoing(req,responsetype,resp||{})
		   end
      end
		  MessageBroker.register_listener(msgtype,proc)
      proc
	  end
	
	  def send_message(req,type,message)
		  MessageBroker.send(req,type,message)
	  end
	  
	  def secure_password_matches?(request,message,password_field,password)
	    
	    password_obj = message[password_field]
	    
      if password_obj
  	    return Digest::MD5.hexdigest(password + request['authtoken']) == password_obj['auth']
      end
	    
	    false
	  end
	end
  
  #
  # Class to allow inspection and equality checking (for adding to sets)
  # TODO: remove the to_s in eql? and hash when the singleton issue is resolved 
  #
  class ServiceProc < Proc
    def self.vars
        [:msgtype, :service, :methodname, :responsetype]
    end
    
    def method_missing name
        eval(name.to_s, self.binding)
    end
    
    def to_s
        "#{msgtype} -> #{service}.#{methodname} -> #{responsetype}"
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
  class Array
    def all? &pred
      each do |e|
        if not pred.call(e)
          return false
        end
      end
      return true
    end
  end
end