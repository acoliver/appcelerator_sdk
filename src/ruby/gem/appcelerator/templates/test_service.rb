
class TestService < Appcelerator::Service
  
  handles_message 'app.test.message.request', :testMessage, 'app.test.message'
  
  def testMessage(request,message)
      p "received message: #{message.inspect}"
      msg = message["message"]
      {"message"=>"I received from you: #{msg}","success"=>true}
  end
  
end

