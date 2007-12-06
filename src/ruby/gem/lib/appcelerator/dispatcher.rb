module Appcelerator
  module Dispatcher
	  
    # dispatch a standard request, called by the service_broker_controller
    #
    def self.dispatch_request(request, response, session)
      message_queue = []
      extract_messages(request, session) do |in_message|
        out_messages = ServiceBroker.send(in_message)
        message_queue.concat(out_messages)
      end
      serialize(message_queue, session.session_id, response.body)
    end
    
    # dispatch a message that was generated in some other way, like the upload_controller
    #
    def self.dispatch_message(request, response, session, message_type, params, request_id)
      msg = Message.new(request, session, message_type, params, request_id)
      
      message_queue = ServiceBroker.send(msg)
      
      serialize(message_queue, session.session_id, response.body)
    end
    
    def self.extract_messages(request, session)
      body = request.env['RAW_POST_DATA']
      if body and body != ''
        node = REXML::Document.new(body)
        node.root.each_element('//message') do |message|
          
          request_id = message.attributes['requestid']
          message_type = message.attributes['type']
          params = JSON.parse(message.text)
          
          yield Message.new(request, session, message_type, params, request_id)
        end
      end
    end
    
    def self.serialize(message_queue, session_id, output)
      output << '<?xml version="1.0"?>'
      output << "<messages version='1.0' sessionid='#{session_id}'>"
      
      message_queue.compact!
      message_queue.each do |msg|
        if msg.response_type
          output << "<message requestid='#{msg.request_id}' direction='OUTGOING' datatype='JSON' type='#{msg.response_type}'><![CDATA["
          output << msg.response.to_json
          output << ']]></message>'
        end
      end
      
      output << '</messages>'
    end
    
    class Message
      attr_accessor :request, :session, :message_type, :params, :request_id, :response_type, :response
      def initialize(request, session, message_type, params, request_id)
        @request = request
        @session = session
        @message_type = message_type
        @params = params
        @request_id = request_id
      end
    end
  end
end

