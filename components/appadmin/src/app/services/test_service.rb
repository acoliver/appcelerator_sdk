
class TestService < Appcelerator::Service
  
  Service 'app.test.message.request', :testMessage, 'app.test.message.response'
  
  def testMessage
      p "received message: #{params.inspect}"
      msg = params["message"]
      {"message"=>"I received from you: #{msg}","success"=>true}
  end
  
end

