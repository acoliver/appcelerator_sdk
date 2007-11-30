
class UploadController < ApplicationController

  def upload
    msg = {}
    params.each do |key, value|
      if value.class == String
        msg[key] = value
      elsif value.class == StringIO
        uniquename = MD5.new(Time.now.to_s).hexdigest.slice(0,8)
        FileUtils.mkdir_p("#{FileUtils.pwd}/tmp/uploads")
        f = File.new("#{FileUtils.pwd}/tmp/uploads/#{uniquename}", 'wb')
        f.write params[key].read
        f.close
        msg[key] = "#{FileUtils.pwd}/tmp/uploads/#{uniquename}"
      end
    end
    
    @callback = params['callback']
    
    req = {'requestid' => 0, 'session' => session, 'orig_request' => request}
    Appcelerator::ServiceBroker.send(req, params['type'], msg)
    Appcelerator::Dispatcher.instance.serialize(session,response.body)
  end
end
