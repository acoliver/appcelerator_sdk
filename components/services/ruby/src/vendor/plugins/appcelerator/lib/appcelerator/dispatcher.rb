#
# This file is part of Appcelerator.
#
# Copyright (c) 2006-2008, Appcelerator, Inc.
# All rights reserved.
# 
# Redistribution and use in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
# 
#     * Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
# 
#     * Redistributions in binary form must reproduce the above copyright notice,
#       this list of conditions and the following disclaimer in the documentation
#       and/or other materials provided with the distribution.
# 
#     * Neither the name of Appcelerator, Inc. nor the names of its
#       contributors may be used to endorse or promote products derived from this
#       software without specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
#

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

