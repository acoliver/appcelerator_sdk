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
	  
	  	def send (req,type,obj)
			array = @listeners[type]
			if array
			  array.each do |listener|
				begin
				  listener.call(req,type,obj)
				rescue => error
				  puts $!
				  raise error
				end
			  end
			  return true
			end
			false
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