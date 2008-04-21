
class DownloadController < ApplicationController

  def index
    request_id = Time.now
    message_type = params['type']
    scope = params['scope'] || 'appcelerator'
    @callback = params['error'] || 'r:appcelerator.download.error'
    result = Appcelerator::Dispatcher.dispatch_message(request, response, session, message_type, params, request_id, scope, self, 'array')

    if result and result.size > 0
      response = result[0]['response']
      type = params['mimetype'] || response[params['mimetypeProperty']] || 'application/octet-stream'
      file = response[params['fileProperty']]
      begin
        begin
          x_send_file(file, :type => type)
        rescue
          send_file(file, :type => type)
        end
      rescue
      end
    end
  end
end