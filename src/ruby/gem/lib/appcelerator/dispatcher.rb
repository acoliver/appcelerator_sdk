module Appcelerator
    class Dispatcher
    	include Singleton
    
		def serialize(session,body)
			queue = session['_app_mq']
			body << '<?xml version="1.0"?>'
			body << "<messages version='1.0' sessionid='#{session.session_id}'>"
			if queue
			  queue.each do |msg|
				body << msg
			  end
			  session['_app_mq']=[]
			end
			body << '</messages>'
		end
		
		def outgoing(obj,type,message)
			queue = obj['session']['_app_mq']
			if !queue
			  queue = [];
			  obj['session']['_app_mq'] = queue
			end
			#TODO requestid
			queue << "<message requestid='' direction='OUTGOING' datatype='JSON' type='#{type}'><![CDATA["
			queue << message.to_json
			queue << ']]></message>'
		end
		
		def incoming(session,request,response)
			body = request.env['RAW_POST_DATA']
			if body and body != ''
			   node = REXML::Document.new(body)
			   node.root.each_element('//message') do |message|
				  requestid = message.attributes['requestid']
				  type = message.attributes['type']
				  text = message.text
				  msg = JSON.parse(text)
				  req = {'requestid'=>requestid, 'session'=>session, 'orig_request'=>request}
				  ServiceBroker.send(req,type,msg)
			   end
			end      
		end
  end
end



# this is the rails dispatcher
require 'dispatcher'

module ClassMethods
  def reset_application_and_services!
    Appcelerator::Service.load_services
    reset_application_but_not_services!
  end
end

Dispatcher.extend(ClassMethods)
Dispatcher.class_eval do
  class << self
    unless method_defined? :reset_application_but_not_services!
      alias_method :reset_application_but_not_services!, :reset_application!
    end
    alias_method :reset_application!, :reset_application_and_services!
  end
end

