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
