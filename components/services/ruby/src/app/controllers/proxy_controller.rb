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
