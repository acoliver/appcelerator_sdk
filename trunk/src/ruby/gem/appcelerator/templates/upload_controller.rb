
class UploadController < ApplicationController

  def index
    request_id = Time.now
    message_type = params['type']
    scope = params['scope'] || 'appcelerator'
    @callback = Appcelerator::Dispatcher.dispatch_message(request, response, session, message_type, params, request_id, scope, self, 'js')
  end
end
