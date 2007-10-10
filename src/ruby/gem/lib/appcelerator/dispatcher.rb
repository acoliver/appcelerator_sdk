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
				  MessageBroker.send(req,type,msg)
			   end
			end      
		end
    end
end