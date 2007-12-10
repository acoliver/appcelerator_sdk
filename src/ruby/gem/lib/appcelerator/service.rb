

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
    attr_accessor :request,:params,:session,:message_type,:response,:response_type

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
      
		  ServiceBroker.register_listener(message_type, proc)
      proc
	  end
	  
	end
  
  # TODO: spin this into another file when we can resolve dependecy issues
  class CrudService < Service
    
    # registration point for crud services
    def Service.service_scaffold(model)
      servicename = model_name(model)
      self.instance.model_class = eval(model.to_s.camelize)
      %w(create retrieve update delete list assembly search).each do |operation|
          messagetype = "app."+ servicename +"."+ operation
          request = messagetype + ".request"
          response = messagetype + ".response"
          self.instance.register(request,operation,response)
          APP_SERVICES << {'name'=>name, 'model'=>servicename}
      end
    end
    
    attr_accessor :model_class
    
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
    
    def to_s
        service = Object.const_get(service_name).instance
        "#{message_type} -> #{service.before_filters} #{service_name}.#{method_name} #{service.after_filters} -> #{response_type}"
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
