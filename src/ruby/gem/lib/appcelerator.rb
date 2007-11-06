require 'json'
require 'action_controller'
require 'active_record'
require 'md5'

unless defined?(APP_VERSION)

	APP_VERSION = '${APP_VERSION}'
	APP_SERVICES = Array.new
 
    def model_name(name)
      name.to_s.gsub(/[::]{2}/,'.').split('.').collect {|token| token.underscore }.join('.')
    end
  
  	def silence_warnings
    	old_verbose, $VERBOSE = $VERBOSE, nil
    	yield
  	ensure
    	$VERBOSE = old_verbose
  	end	

    #
    # OK, I realize this might be a little bad, but we include a few dependencies 
    # which print out stupid warnings on boot - we're going to suppress that
    #
    silence_warnings do 
	    #
  		# require dependencies
  		#
		  Dir[File.dirname(__FILE__)+'/appcelerator/**/*.rb'].sort.each do |file|
			  require file[0..-4]
		  end
	  end
	  
    #
    # trick to allow changing ActiveRecord logging stream
    #
    def log_to(stream)
      ActiveRecord::Base.logger = Logger.new(stream)
      ActiveRecord::Base.clear_active_connections!
    end

    #
    # shortcut to turn on logging to stdout
    #
    def log_to_stdout
       log_to STDOUT
    end	
    
    Appcelerator::Service.load_services
    
    #
    # register a message broker listener for admin appcelerator models
    #
    sam_proc = Proc.new do |req,type,obj|
      resp = {'success'=>true, 'models'=> APP_SERVICES}
  	  Appcelerator::Dispatcher.instance.outgoing(req,'app.admin.models.response',resp)
    end
    Appcelerator::MessageBroker.register_listener('app.admin.models.request',sam_proc)

  	puts "=> Appcelerator on Rails #{APP_VERSION}"
end