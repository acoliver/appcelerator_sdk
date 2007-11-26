require 'digest/md5'

module RequestMixin
  def authtoken=(t)
    @_authtoken = t
  end
  def authtoken
    @_authtoken
  end
end

module ServiceBroker
  
    def log_processing
      # turn off logging since we get a lot of these requests
    end

	  def dispatch	    
  		session = request.session
  		
      # we check to make sure we're coming from an XHR request
      # this is easy to forge but a simple check
      #
  	  if not request.xml_http_request? and not request.xhr?
        logger.error("client error = not XHR request")
        session.delete
  	    render :nothing => true, :status => 400
  	    return
      end
    
  		response.headers['Content-Type'] = 'text/xml' 
  		response.headers['Pragma'] = 'no-cache'
  		response.headers['Cache-Control'] = 'no-cache, no-store, private, must-revalidate'
  		response.headers['Expires'] = 'Mon, 26 Jul 1997 05:00:00 GMT'

  		Appcelerator::Dispatcher.instance.incoming(session,request,response)
  		Appcelerator::Dispatcher.instance.serialize(session,response.body)

      @performed_render = true
	end
end
