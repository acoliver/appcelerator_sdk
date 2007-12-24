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