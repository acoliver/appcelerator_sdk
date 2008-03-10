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
