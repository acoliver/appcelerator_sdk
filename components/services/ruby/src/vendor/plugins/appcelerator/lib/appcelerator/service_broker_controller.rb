#
# This file is part of Appcelerator.
#
# Copyright (c) 2006-2008, Appcelerator, Inc.
# All rights reserved.
# 
# Redistribution and use in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
# 
#     * Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
# 
#     * Redistributions in binary form must reproduce the above copyright notice,
#       this list of conditions and the following disclaimer in the documentation
#       and/or other materials provided with the distribution.
# 
#     * Neither the name of Appcelerator, Inc. nor the names of its
#       contributors may be used to endorse or promote products derived from this
#       software without specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
#

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
