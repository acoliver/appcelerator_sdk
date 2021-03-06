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

require 'thread'
require 'singleton'
require 'net/https' 
require 'net/http'

module Appcelerator
  class Collector
    include Singleton
    
    attr_accessor :interval,:systemid,:endpoint
    
    def initialize
      @mutex = Mutex.new
      @collection_mutex = Mutex.new
      @resource = ConditionVariable.new
      @running = true
      @queue = Array.new
      @collectors = Array.new
      @interval = 10
      @systemid = nil
      @endpoint = nil
      @thread = Thread.new do
        while @running
          copy = nil
          @mutex.synchronize do
            @resource.wait @mutex
            break unless @running
            if not @queue.empty?
              copy = [].concat @queue
              @queue.clear
            end
          end
          process(copy) unless copy.nil?
        end
      end
      @timer = Thread.new do
        loop do
          sleep @interval
          begin
            transmit
          rescue
          end
        end
      end
    end
    
    def add(c)
      @collectors << c
    end
    
    def receive(data)
      @mutex.synchronize do
        @queue << data
        @resource.signal
      end
    end
    
    def shutdown
      @mutex.synchronize do
        @running = false
        @resource.signal
      end
      @timer.kill
    end

    def transmit(action='agent.update',data={},collections=true)

      data['ver']=1.1 # this is the protocol version
      data['systemid']=@systemid
      data['action']=action

      if collections
        @collection_mutex.synchronize do
          @collectors.each do |collector|
            data[collector.key] = collector.collect
          end
        end
      end

      begin
        #TODO: use proxy settings from app command config
        
        post_data = CGI::escape(Zlib::Deflate.deflate(data.to_json, Zlib::BEST_SPEED))
        
        request = Net::HTTP.new(@endpoint.host, @endpoint.port) 
        
        if @endpoint.scheme == 'https'
          request.use_ssl = true 
          request.verify_mode = OpenSSL::SSL::VERIFY_NONE
        end

        response = request.start do |http|
          http.post(@endpoint.path, post_data) 
        end

        if response.is_a? Net::HTTPSuccess
          response JSON.parse(Zlib::Inflate.inflate(CGI::unescape(response.body)))
        else
          raise Exception.new("#{response.code}: #{response.message}")
        end

      rescue => e
        $stderr.puts "[#{Time.now}] Error sending to #{@endpoint}, Error was: #{e}"
      end
    end
    
    private

    def process(data,ready=false)
      @collection_mutex.synchronize do
        data.each do |entry|
          @collectors.each do |collector|
            r = collector.process(entry)
            ready = true if r===true
          end
        end
      end
      transmit if ready
    end
    
    def response(data)
    end
    
  end
end


#
# load all our collectors
#
Dir["#{File.dirname(__FILE__)}/collectors/*.rb"].each do |f|
  require f.gsub('.rb','')
end

