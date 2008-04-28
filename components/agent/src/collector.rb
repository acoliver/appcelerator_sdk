#
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

