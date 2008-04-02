#
# Appcelerator SDK
#
# Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
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
