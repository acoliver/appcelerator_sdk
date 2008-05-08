
class TestService < Appcelerator::Service
  
  Service 'app.test.message.request', :testMessage, 'app.test.message.response'
  
  def testMessage
      logger.info "received message: #{params.inspect}"
      msg = params["message"]
      {"message"=>"I received from you: #{msg}","success"=>true}
  end
  
  def another_test
    #
    # this method can be invoked using the pattern:
    # 
    # test.another.test.request 
    # test.another.test.response
    #
    # where the pattern is <Class_excluding_Service>.<method_underscored_with_dots> 
    #
    # and you don't need to import with Service method above
    #
    logger.info "received message: #{params.inspect}"
    msg = params["message"]
    {"message"=>"I received from you: #{msg}","success"=>true}
  end
  
end

