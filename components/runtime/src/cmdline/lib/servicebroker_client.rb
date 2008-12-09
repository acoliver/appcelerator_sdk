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

require 'net/http'
require 'uri'
require 'md5'
require 'yaml'
require 'cgi'
require File.join(File.dirname(__FILE__),'cookie')

# -------------------------------------------------------------------------------------
#
# From: http://deftcode.com/code/flickr_upload/multipartpost.rb
# Helper class to prepare an HTTP POST request with a file upload
# Mostly taken from
# http://blade.nagaokaut.ac.jp/cgi-bin/scat.rb/ruby/ruby-talk/113774
# WAS:
# Anything that's broken and wrong probably the fault of Bill Stilwell
# (bill@marginalia.org)
# NOW:
# Everything wrong is due to keith@oreilly.com
#
module Multipart
  class Param
    attr_accessor :k, :v
    def initialize( k, v )
      @k = k
      @v = v
    end

    def to_multipart
      return "Content-Disposition: form-data; name=\"#{k}\"\r\n\r\n#{v}\r\n"
    end
  end

  class FileParam
    attr_accessor :k, :filename, :content, :mimetype
    def initialize( k, filename, content, mimetype )
      @k = k
      @filename = filename
      @content = content
      @mimetype = mimetype
    end

    def to_multipart
      return "Content-Disposition: form-data; name=\"#{k}\"; filename=\"#{filename}\"\r\n" + "Content-Transfer-Encoding: binary\r\n" + "Content-Type: #{@mimetype}\r\n\r\n" + content + "\r\n"
    end
  end
  
  class MultipartPost
    BOUNDARY = 'appcelerator-'+rand(Time.now.to_f).to_s
    HEADER = {"Content-type" => "multipart/form-data, boundary=" + BOUNDARY + " "}

    def prepare_query (params)
      fp = []
      params.each {|k,v|
        if v.respond_to?(:read)
          fp.push(FileParam.new(k, File.basename(v.path), v.read, 'application/octet-stream'))
        else
          fp.push(Param.new(k,v))
        end
      }
      query = fp.collect {|p| '--' + BOUNDARY + "\r\n" + p.to_multipart }.join('') + '--' + BOUNDARY + '--'
      return query, HEADER
    end
  end  
end
#
#--------------------- end HTTP POST helper content ---------------------
#


#
# Simple ServiceBroker client implementation
#
# This class is a very simple and dirty hack to allow a ruby client
# to talk with a remote appcelerator-based server backend to invoke
# a set of services and get their response
#
#   sc = Appcelerator::ServiceBrokerClient.new('http://localhost/~jhaynie/php')
#   sc.send('app.test.message.request',{'message'=>'hello world'})
#
# will return the following Hash:
#
#   {
#     :message=>"app.test.message.response",
#     :data=>{"message"=>"I recieved from you: hello world","success"=>true}
#   }
#
# You can also post to the upload endpoint 
#
#   sc.upload('app.test.upload.request',{'blah'=>'foo','file'=>File.open('a.txt','r')})
#  
#
module Appcelerator

  class ServiceBrokerClient
    
	  attr_reader :cookies
	
    def initialize(url,debug=false)
      @url = URI.parse(url)
      @instanceid = nil
      @auth = nil
      @sessionid = nil
      @upload = nil
      @debug = debug
      @cookies = CookieJar.new
      bootstrap
    end

    #
    # perform an upload to the remote upload endpoint
    #
    # the params can contain 0 or more File objects (or any kind of stream)
    # which will be attached to the post as an upload file
    #
    def upload(type,params)
      raise "upload not supported by this endpoint" unless @upload

      params['type'] = convert_type(type)

      mp = Multipart::MultipartPost.new
      query,headers = mp.prepare_query(params)

      params['instanceid']=@instanceid
      params['auth']=@auth
      params['ts']=Time.now.to_i

      # send of session cookie
      headers['Cookie'] = @cookies.to_s if @cookies

      #
      # send the POST
      #     
      puts "Posting[path: #{@upload}, query: #{query}, headers: #{headers}]"  if OPTIONS[:verbose]
      res  = get_http(@url.host,@url.port) do |http|
         http.post("/#{@upload}",query,headers);
      end
      
      # make sure we reset cookies if necessary
      get_cookies(res)
      
      puts "Response code from /#{@upload} was #{res.code}" if @debug
      
      if res.code.to_i == 200
        body = res.body

        puts "Response body from /#{@upload} was #{body}" if @debug
      
        # pull out our response
        rm = body.match(/window\.parent\.\$MQ\((.*?)\);/) if body
      
        if rm and rm[1]
          rmc = rm[1].split(', ')
      
          response_type = convert_type(strip_quotes(rmc[0]))
          response_payload = rmc[1]
          response_scope = strip_quotes(rmc[2])
          json_response = json_decode(response_payload)

          puts "response_type=#{response_type},response_payload=#{response_payload},response_scope=#{response_scope}" if @debug

      	  return {:message=>response_type,:data=>json_response,:scope=>response_scope}
      	end
      end
      
      {:message=>nil, :data=>{'success'=>false}, :scope=>nil}
    end
	
    #
    # send a service broker request denoted by type
    # and data (optional) as a hash which will be loosely
    # json-encoded and sent to the server as part of data payload
    #
    # the response will be a hash which has 2 keys (similar to client code)
    # message => response message name
    # data => data payload as hash
    #
    def send(type,data={},scope='appcelerator')
      type = convert_type(type)
      json_data = json_encode(data)
      #
      # build XML/JSON payload
      #
      xml = "<?xml version=\"1.0\"?>\n"
      xml<< '<request version="1.0" idle="0" timestamp="0" tz="0">'
      xml<< "<message requestid=\"1\" type=\"#{type}\" datatype=\"JSON\" scope=\"#{scope}\" version=\"1.0\"><![CDATA[#{json_data}]]></message>"
      xml<< '</request>'  
      xml.strip!
      
      puts "Sending remote request with payload=> #{xml}" if @debug
      
      #
      # build the path to the server
      #
      path = "/#{@servicebroker}?maxwait=0&instanceid=#{@instanceid}&auth=#{@auth}&ts=#{Time.now.to_i}"
      req  = Net::HTTP::Post.new(path)
      req.body = xml
      # attempt to simulate browser
      req.set_content_type('text/xml')
      req['X-Requested-With'] = 'XMLHttpRequest'
      # send of session cookie
      req['Cookie'] = @cookies.to_s if @cookies
      
      #
      # send the POST
      #
      puts "Sending Post[req: #{req.inspect}]"  if OPTIONS[:verbose]
      res  = get_http(@url.host,@url.port) do |http|
         http.request(req)
      end
      
      # make sure we reset cookies if necessary
      get_cookies(res)
      
      response = Hash.new
      json_response = Hash.new
      
      #
      # if we get 200, we have data
      #
      if res.code.to_i == 200

        body = res.body
        
        puts "received remote response => #{body}" if @debug
        
        # currently we only support one response message in the data payload
        # extract it using simple regex
        #
        m = body.match(/<message (.*?)><!\[CDATA\[(.*?)\]\]><\/message>/)
        
        if m and m[1]  # check to see if we have a response (not required)
          #
          # split the attributes of message into hash
          #
          m[1].split(' ').map do |item|
              t = item.split('=')
              k = strip_quotes t[0]
              v = strip_quotes t[1]
              response[k]=v
          end
          json_response = json_decode(m[2])
        else
          json_response = {}
        end
      else
        puts "received error: #{res.code} => #{res.body}" if @debug
      end

	    {:message=>convert_type(response['type']),:data=>json_response,:scope=>response['scope']||scope}
    end
    def get_http(host,port)
      require 'uri'
      proxy = Installer.get_proxy
      if !proxy.nil? && !(proxy=='')
        uri = URI.parse(proxy)
        proxy_user, proxy_pass = uri.userinfo.split(/:/) if uri.userinfo
        proxy_host = uri.host
        proxy_port = uri.port
      end
      if !proxy_host.nil? && !(proxy_host=='')
        puts "proxy: #{proxy_host}, #{proxy_port}, #{proxy_user}, #{proxy_pass}"  if OPTIONS[:verbose]
        proxy_class = Net::HTTP::Proxy(proxy_host, proxy_port,proxy_user,proxy_pass)
        res = proxy_class.start(host,port) do  |http|
          yield http
        end
        return res
      else
        res = Net::HTTP.start(host, port) do |http|
            yield http
        end
        return res
      end
    end

    private
    
    def strip_quotes(k)
      if k=~ /^["'].*["']$/
        k = k[1..-2]
      end
      k
    end

    #
    # this is an absolutely minimal hack for encoding a ruby object
    # into JSON - it's not foolproof at all - be warned
    #
    def json_encode(obj)
      obj.to_json
    end
    
    def json_decode(json_str)
      return JSON.parse(json_str)
    end
    
    def get_cookies(response)
      return unless response['set-cookie']
      @cookies.parse response['set-cookie']
      @sessionid = @cookies[@sessionname]
      reset_auth_token
    end
    def reset_auth_token
      @auth = MD5::hexdigest "#{@sessionid}#{@instanceid}"
    end
    def bootstrap
      #
      # get the appcelerator.xml file
      #
      puts "getting appcelerator.xml[path: #{@url.path}/appcelerator.xml]"  if OPTIONS[:verbose]
      res = get_http(@url.host, @url.port) do |http|
        http.get("#{@url.path}/appcelerator.xml")
      end

      xml = res.body
      
      if not xml or xml == '' or xml.nil?
        STDERR.puts "No response received update server at #{@url}"
        exit 1
      end
      
      #
      # find out path to service broker and the name of the cookie we
      # need to read
      #
      sb = xml.match(/<servicebroker.*?>(.*?)<\/servicebroker>/)
      
      if not sb
        STDERR.puts "Invalid response received update server at #{@url}" unless OPTIONS[:quiet]
        exit 1
      end
      
      @servicebroker = sb[1].gsub('@{rootPath}',@url.path)
      
      ul = xml.match(/<upload>(.*?)<\/upload>/)
      if ul
        @upload = ul[1].gsub('@{rootPath}',@url.path)
      end
      
      # get the sessionid cookiename
      sn = xml.match(/<sessionid>(.*?)<\/sessionid>/)
      @sessionname = sn[1]
       
      req = Net::HTTP::Get.new("/#{@servicebroker}?initial=1")
      req.set_content_type('text/xml')
      req['X-Requested-With'] = 'XMLHttpRequest'
      puts "Bootstrap[req: #{req.inspect}]" if OPTIONS[:verbose]
      response = get_http(@url.host,@url.port) do |http|
        http.request(req)
      end
      @instanceid = Time.now.to_i.to_s + "-" + (rand(1000)).to_s
      get_cookies(response)
    end

    def convert_type(type)
      type.gsub!(/^r:/,'') if type
      type.gsub!(/^remote:/,'') if type
      type
    end

  end  
  
end

