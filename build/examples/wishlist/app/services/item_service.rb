
class ItemService < Appcelerator::Service
  
  Service 'app.test.message.request', :testMessage, 'app.test.message.response'
  
  def testMessage(request,message)
      p "received message: #{message.inspect}"
      msg = message["message"]
      {"message"=>"I received from you: #{msg}","success"=>true}
  end
  
end

