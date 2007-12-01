
class UploadController < ApplicationController

  def get_extension(mimetype)
    case mimetype
      when 'image/png'
        return 'png'
      when 'image/gif'
        return 'gif'
      when 'image/jpeg'
        return 'jpg'
    end
  end
  
  def make_temp_file(value)
    extension = get_extension value.content_type.strip || ''
    uniquename = MD5.new(Time.now.to_s).hexdigest.slice(0,8).gsub(/[^\w\.\-]/,'_') 
    FileUtils.mkdir_p("#{FileUtils.pwd}/tmp/uploads")
    f = File.new("#{FileUtils.pwd}/tmp/uploads/#{uniquename}.#{extension}", 'wb')
    f.write value.read
    f.close
    f
  end
  
  def upload
    msg = {}
    params.each do |key, value|
      case value.class.to_s
        when 'String'
          msg[key] = value
        when 'StringIO'
          msg[key] = make_temp_file value
        when 'Tempfile'
          msg[key] = make_temp_file value
      end
    end
    
    cb = params['callback']
    
    if cb
      if cb =~ /^(r:|remote:|l:|local:)/
        @callback = "window.parent.$MQ('#{cb}');"
      else
        @callback = cb
      end
    else
      @callback = ''
    end

    req = {'requestid' => Time.now, 'session' => session, 'orig_request' => request}
    Appcelerator::ServiceBroker.send(req, params['type'], msg)

  end
end
