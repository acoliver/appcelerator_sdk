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


#
# implementation of the service broker which only dispatches
# messages to internally registered listeners
#
#
require 'set'
module Appcelerator
  class InmemoryServiceBroker
    include Singleton
    
    attr_accessor :listeners
    
    def initialize 
      @listeners={}
    end	  	
    
    def register_listener(msgtype,listener)      
      begin
        @listeners[msgtype] << listener
      rescue
        @listeners[msgtype] = LastInSet.new << listener
      end
    end
    
    def unregister_listener(msgtype,listener)
      array = @listeners[msgtype]
      array.delete_if { |a| a == listener } if array
    end
    
    def clear_listeners
      @listeners.clear
    end
    
    def send(msg)
      begin
        array = @listeners[msg.message_type] || []
        
        array.map do |listener|
          listener.call(msg.clone)
        end
      rescue => error
        puts $!
        raise error
      end
    end
    
    def diagnostics
      all = []
      @listeners.each do |k,v|
        v.each do |proc|
          all << proc.to_s
        end
      end
      all.join "\n"
    end
  end
  
  class LastInSet < Set
    alias :first_in_add :add
    def add elem
      delete elem
      first_in_add elem
    end
    alias :<< :add
  end
end