
class <%= messageclass %> < Appcelerator::Service

  Service '<%= messagetype %>', :<%= messagefunc %><%= responsetype %>

  def <%= messagefunc %>(request,message)

      # TODO: implement service code
      p "received message #{type} with #{message.inspect}"
      
      <%= response %>
  end

end
