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


require 'digest/md5'

module RequestMixin
  def authtoken=(t)
    @_authtoken = t
  end
  def authtoken
    @_authtoken
  end
end

module ServiceBroker
  def log_processing
  # turn off logging since we get a lot of these requests
  end

  def dispatch	    
    session = request.session

    # we check to make sure we're coming from an XHR request
    # this is easy to forge but a simple check
    #
    if not request.xml_http_request? and not request.xhr?
      logger.error("client error = not XHR request")
      render :nothing => true, :status => 400
      return
    end

    # check to see if we're doing an initial request to cause the 
    # cookie to get set
    if request.parameters[:initial]
      render :nothing => true, :status => 202
      return
    end

    authtoken = request.parameters[:auth]
    if authtoken.nil?
      logger.error("client error = missing auth token")
      render :nothing => true, :status => 400
      return
    end

    ts = request.parameters[:ts]
    if ts.nil?
      logger.error("client error = missing timestamp")
      render :nothing => true, :status => 400
      return
    end

    instanceid = request.parameters[:instanceid]
    if instanceid.nil?
      logger.error("client error = missing instanceid")
      render :nothing => true, :status => 400
      return
    end

    #
    # security check - make sure our hash is correct 
    #
    authcheck = Digest::MD5.hexdigest(session.session_id + instanceid)

    if authcheck != authtoken
      logger.error("client error = authtoken didn't not properly compute")
      render :nothing => true, :status => 400
      return
    end

    response.headers['Pragma'] = 'no-cache'
    response.headers['Cache-Control'] = 'no-cache, no-store, private, must-revalidate'
    response.headers['Expires'] = 'Mon, 26 Jul 1997 05:00:00 GMT'
    if request.content_type == 'application/json'
      response.headers['Content-Type'] = 'application/json;charset=UTF-8'
    elsif request.content_type == 'text/xml'
      response.headers['Content-Type'] = 'text/xml;charset=UTF-8'
    end
    Appcelerator::Dispatcher.dispatch_request(request,response,session,self)
    @performed_render = true
	end
end
