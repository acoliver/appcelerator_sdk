#
# implementation of the message broker which only dispatches
# messages to internally registered listeners
#
#
module Appcelerator
	class InmemoryMessageBroker
		include Singleton

		def initialize 
			@listeners={}
		end	  	
	
	  	def register_listener(type,listener)
			array = @listeners[type]
			if array==nil
			  array=[]
			  @listeners[type]=array
			end
			array << listener
	  	end
	  	
	  	def unregister_listener(type,listener)
	  		array = @listeners[type]
	  		array.delete_if { |a| a == listener } if array
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
	end
end