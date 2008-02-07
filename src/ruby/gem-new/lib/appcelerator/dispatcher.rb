#
# Appcelerator SDK
#
# Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
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
      serialize(message_queue, session.session_id, response.body)
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
      body = request.env['RAW_POST_DATA']
      if body and body != ''
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
    
    def self.serialize(message_queue, session_id, output, type = 'xml')
      if type == 'js'
        message_queue.compact!
        message_queue.each do |msg|
          if msg.response_type
            output << "window.parent.$MQ('r:#{msg.response_type}', #{msg.response.to_json}, '#{msg.scope}');"
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

