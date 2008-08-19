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

#
# implementation of the service broker which only dispatches
# messages to internally registered listeners
#
#
require 'set'
module Appcelerator
  class InmemoryServiceBroker
    include Singleton
    
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