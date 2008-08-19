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
    
    session_id = cookies[_session_id_key] || ''
    
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
