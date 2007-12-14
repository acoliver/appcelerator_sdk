require 'base64'

class ProxyController < ApplicationController

  def index
    url = params['url'] if params
    if url
      if url.index('://') == -1
        url = Base64.decode64(url)
      end
      if request.post?
       uri = URI.parse(url)
       req = Net::HTTP::Post.new(uri.to_s)
       req.body = request.raw_post
       res = Net::HTTP.new(uri.host, uri.port).start {|http| http.request(req) }
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
