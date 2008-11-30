#
# Copyright 2006-2008 Appcelerator, Inc.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#    http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License. 

require 'rubygems'
require 'digest/md5'

class ServiceBroker < Application
  
  provides :xml,:json
  
  def dispatch
    
    # we check to make sure we're coming from an XHR request
    # this is easy to forge but a simple check
    #
    if not request.xml_http_request? and not request.xhr?
      Merb.logger.error("client error = not XHR request")
      raise BadRequest
    end
    
    # check to see if we're doing an initial request to cause the 
    # cookie to get set
    if request.params[:initial]
      session[:last_hit] = Time.now  # merb won't create session if you don't put stuff in it
      status = 202
      return ''
    end

    authtoken = request.params[:auth]
    if authtoken.nil?
      Merb.logger.error("client error = missing auth token")
      raise BadRequest
    end
    
    ts = request.params[:ts]
    if ts.nil?
      Merb.logger.error("client error = missing timestamp")
      raise BadRequest
    end
    
    instanceid = request.params[:instanceid]
    if instanceid.nil?
      Merb.logger.error("client error = missing instanceid")
      raise BadRequest
    end
    
	 session_id = cookies[Merb::Config[:session_id_key]] || ''
    
    #
    # security check - make sure our hash is correct 
    #
    authcheck = Digest::MD5.hexdigest(session_id + instanceid)
    
    if authcheck != authtoken
      Merb.logger.error("client error = authtoken didn't not properly compute")
      raise BadRequest
    end
    
    session[:last_hit] = Time.now  # merb won't create session if you don't put stuff in it
    headers['Pragma'] = 'no-cache'
    headers['Cache-Control'] = 'no-cache, no-store, private, must-revalidate'
    headers['Expires'] = 'Mon, 26 Jul 1997 05:00:00 GMT'
    
    format = nil
    # we need to use the real HTTP header not the convenience accesor because 
    # it returns html instead of the real mimetype - also, trim off the encoding part
    contenttype = request.env['CONTENT_TYPE'].split(';').first
    
    if contenttype == 'application/json'
      format = :json
    elsif contenttype == 'text/xml'
      format = :xml
    end
    
    render Appcelerator::Dispatcher.dispatch_request(request,contenttype,session,session_id,self), :format=>format
  end
end
