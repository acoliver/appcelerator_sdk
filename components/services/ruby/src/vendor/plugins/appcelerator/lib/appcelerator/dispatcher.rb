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


module Appcelerator
  module Dispatcher
	  
    # dispatch a standard request, called by the service_broker_controller
    #
    def self.dispatch_request(request, response, session, controller)
      message_queue = []
      extract_messages(request, session) do |in_message|
        in_message.controller = controller
        out_messages = ServiceBroker.send(in_message)
        message_queue.concat(out_messages)
      end
      if request.content_type == 'application/json'
        type = 'json'
      else
        type = 'xml'
      end
      serialize(message_queue, session.session_id, response.body, type)
    end
    
    # dispatch a message that was generated in some other way, like the upload_controller
    #
    def self.dispatch_message(request, response, session, message_type, params, request_id, scope, controller, type = 'xml')
      msg = Message.new(request, session, message_type, params, request_id, scope)
      msg.controller = controller
      message_queue = ServiceBroker.send(msg)

      serialize(message_queue, session.session_id, response.body, type)
    end
    
    def self.extract_messages(request, session)
      body = request.raw_post
      if body and body != ''
        if request.content_type == 'application/json'
          json = JSON.parse(body)
          
          if json['request'].nil?
            messages = json['messages']
          else
            messages = json['request']['messages']
          end
          
          if messages
            messages.each do |message|
              request_id = message['requestid']
              message_type = message['type']
              scope = message['scope']
              params = message['data']
              yield Message.new(request, session, message_type, params, request_id, scope) 
            end
          end
        elsif request.content_type == 'text/xml'
          node = REXML::Document.new(body)
          node.root.each_element('//message') do |message|
            request_id = message.attributes['requestid']
            message_type = message.attributes['type']
            scope = message.attributes['scope']
            params = JSON.parse(message.text)
            yield Message.new(request, session, message_type, params, request_id, scope)
          end
        end
      end
    end
    
    def self.serialize(message_queue, session_id, output, type = 'xml')
      if type == 'js'
        message_queue.compact!
        message_queue.each do |msg|
          if msg.response_type
            if not msg.response_type =~ /^[rl]:/
              msg.response_type = "r:#{msg.response_type}"
            end
            output << "window.parent.$MQ('#{msg.response_type}', #{msg.response.to_json}, '#{msg.scope}');"
          end
        end
        output
      elsif type == 'array'
        output = Array.new
        message_queue.compact!
        message_queue.each do |msg|
          if msg.response_type
            output.push({'type' => msg.response_type, 'response' => msg.response})
          end
        end
        output
      elsif type == 'json'
        result = {}
        result['sessionid'] = session_id
        messages = Array.new
        message_queue.compact!
        message_queue.each do |msg|
          if msg.response_type
            messages.push({'requestid' => msg.request_id, 'direction' => 'OUTGOING', 'datatype' => 'JSON', 
              'type' => msg.response_type, 'scope' => msg.scope, 'data' => msg.response})
          end
        end
        result['messages'] = messages
        output << result.to_json
      else
        output << '<?xml version="1.0" encoding="UTF-8"?>'
        output << "<messages version='1.0' sessionid='#{session_id}'>"
      
        message_queue.compact!
        message_queue.each do |msg|
          if msg.response_type
            output << "<message requestid='#{msg.request_id}' direction='OUTGOING' datatype='JSON' type='#{msg.response_type}' scope='#{msg.scope}'><![CDATA["
            output << msg.response.to_json
            output << ']]></message>'
          end
        end
        output << '</messages>'
      end
    end
    
    class Message
      attr_accessor :request, :session, :message_type, :params, :request_id, :response_type, :response, :scope, :controller
      def initialize(request, session, message_type, params, request_id, scope)
        @request = request
        @session = session
        @message_type = message_type
        @params = params
        @request_id = request_id
        @scope = scope
      end
    end
  end
end

