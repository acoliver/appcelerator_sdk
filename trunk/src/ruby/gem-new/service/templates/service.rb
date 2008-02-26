
class <%= messageclass %> < Appcelerator::Service

  Service '<%= messagetype %>', :<%= messagefunc %>, '<%= responsetype %>'

  def <%= messagefunc %>

      # TODO: implement service code
      p "received message #{type} with #{params.inspect}"
      
      <%= response %>
  end

end
