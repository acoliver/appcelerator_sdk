
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
  
  def index
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
    
    request_id = Time.now
    message_type = params['type']
    scope = params['scope'] || 'appcelerator'
    @callback = Appcelerator::Dispatcher.dispatch_message(request, response, session, message_type, msg, request_id, scope, true)

  end
end
