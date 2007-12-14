require 'base64'

class ProxyController < ApplicationController

  def index
        url = params['url'] if params
        if url
            if url.index('://') == -1
                url = Base64.decode64(url)
            end
            if request.post?
               res = Net::HTTP.post(URI.parse(url),request.raw_post)
            else
               res = Net::HTTP.get_response(URI.parse(url))
            end
            res.each_header do |key,value|
                response.headers[key]=value unless key =~ /(transfer-encoding|set-cookie)/
            end
            render :inline => res.body
        end
  end
end
