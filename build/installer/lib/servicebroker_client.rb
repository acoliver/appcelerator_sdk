# Appcelerator SDK
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
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
require 'net/http'
require 'uri'
require 'md5'
require 'yaml'
require 'cgi'
require File.join(File.dirname(__FILE__),'cookie')

begin
    require 'rubygems'
    json = Gem.cache.search('json')
    if json and json.first
      require 'json'
      SBC_HAS_JSON = true
    else
      SBC_HAS_JSON = false
    end
rescue
    SBC_HAS_JSON = false
end  

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
#
module Appcelerator

  class ServiceBrokerClient
    
	attr_reader :cookies
	
    def initialize(url,debug=false)
      @url = URI.parse(url)
      @instanceid = nil
      @auth = nil
      @sessionid = nil
      @debug = debug
      @cookies = CookieJar.new
      bootstrap
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
    def send(type,data={})

      type.gsub!(/^r:/,'')
      type.gsub!(/^remote:/,'')
      
      json_data = json_encode(data)
      
      #
      # build XML/JSON payload
      #
      xml = "<?xml version=\"1.0\"?>\n"
      xml<< '<request version="1.0" idle="0" timestamp="0" tz="0">'
      xml<< "<message requestid=\"1\" type=\"#{type}\" datatype=\"JSON\" scope=\"appcelerator\" version=\"1.0\"><![CDATA[#{json_data}]]></message>"
      xml<< '</request>'  
      xml.strip!
      
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
      res  = Net::HTTP.new(@url.host,@url.port).start do |http|
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
        
        # currently we only support one response message in the data payload
        # extract it using simple regex
        #
        m = body.match(/<message (.*?)><!\[CDATA\[(.*?)\]\]><\/message>/)
        
        #
        # split the attributes of message into hash
        #
        m[1].split(' ').map do |item|
            t = item.split('=')
            k = t[0]
            v = t[1]
            if k=~ /^["'].*["']$/
              k = k[1..-2]
            end
            if v=~ /^["'].*["']$/
              v = v[1..-2]
            end
            response[k]=v
        end
        json_response = json_decode(m[2])
      end

	  {:message=>response['type'],:data=>json_response}
    end

    private

    #
    # this is an absolutely minimal hack for encoding a ruby object
    # into JSON - it's not foolproof at all - be warned
    #
    def json_encode(obj)
      
      return obj.to_json if SBC_HAS_JSON
      
      case obj.class.to_s
        when 'String'
          return "\"#{obj}\""
        when 'Fixnum','TrueClass','FalseClass'
          return obj.to_s
        when 'NilClass'
          return 'null'
        when 'Date'
          return %("#{obj.strftime("%Y/%m/%d %H:%M:%S %z")}")
        when 'Array'
          str = '['
          obj.each_with_index do |e,index|
            str << json_encode(e)
            str << ',' if index < obj.length
          end
          str << ']'
          return str
      end
      
      str = '{'
      values = []
      obj.each do |k,v|
        values << "\"#{k}\":#{json_encode(v)}"
      end
      str << values.join(',')
      str << '}'
      str

    end
    
    def json_decode(json_str)
        
      return JSON.parse(json_str) if SBC_HAS_JSON
      
      json_str_post = json_str.gsub(/":/,'": ').gsub(/,"/,', "')

      puts "response (in)=> #{json_str}" if @debug
      puts "response (out)=> #{json_str_post}" if @debug
        
      yaml = YAML::load_stream(json_str_post)
        
      begin
          # get the first doc since we only have one doc in this struct
          yaml = yaml[0]
      rescue
          yaml = Hash.new
      end
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
      res = Net::HTTP.start(@url.host, @url.port) do |http|
        http.get("#{@url.path}/appcelerator.xml")
      end
      
      xml = res.body
      
      #
      # find out path to service broker and the name of the cookie we
      # need to read
      #
      sb = xml.match(/<servicebroker.*?>(.*?)<\/servicebroker>/)
      @servicebroker = sb[1].gsub('@{rootPath}',@url.path)
      
      sn = xml.match(/<sessionid>(.*?)<\/sessionid>/)
      @sessionname = sn[1]
      
      req = Net::HTTP::Get.new("/#{@servicebroker}?initial=1")
      req.set_content_type('text/xml')
      req['X-Requested-With'] = 'XMLHttpRequest'

      response = Net::HTTP.start(@url.host,@url.port) do |http|
        http.request(req)
      end
      
      @instanceid = Time.now.to_i.to_s + "-" + (rand(1000)).to_s
      get_cookies(response)
    end
  end  
end
