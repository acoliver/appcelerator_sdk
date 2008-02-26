# This file is part of Appcelerator.
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# Appcelerator is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#


require 'base64'

class ProxyController < ApplicationController

  def index
    url = params['url'] if params
    if url
      if url.index('://') == -1
        url = Base64.decode64(url)
      end
      uri = URI.parse(url)
      relative = '/' + uri.to_s[/http:\/\/[^\/]*\/(.*)$/, 1]
      
      req = nil
      case request.request_method.to_s
        when 'post'
          req = Net::HTTP::Post.new(relative)
          req.body = request.raw_post
        when 'get'
          req = Net::HTTP::Get.new(relative)
        when 'options'
          req = Net::HTTP::Options.new(relative)
        when 'put'
          req = Net::HTTP::Put.new(relative)
          req.body = request.raw_post
        when 'delete'
          req = Net::HTTP::Delete.new(relative)
      end

      res = Net::HTTP.start(uri.host, uri.port) do |http| 
        http.request(req)
      end

      res.each_header do |key,value|
        response.headers[key]=value unless key =~ /(transfer-encoding|set-cookie)/
      end
      
      render :inline=> res.body, :status=> res.code
    end
  end
end
