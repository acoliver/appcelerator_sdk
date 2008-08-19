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
require 'singleton'
require 'yaml'
require 'webrick'
require 'rubygems'
require 'json'
require 'collector'
require 'socket'
require 'cgi'
require 'zlib'

#
# Agent is responsible for collecting local data and sending it to the 
# remote network for managing your apps.
#
#
module Appcelerator
  
  class Servlet < WEBrick::HTTPServlet::AbstractServlet
    def do_GET(req, res)
      res.body = '<HTML>Nothing here for ya.</HTML>'
      res['Content-Type'] = 'text/html'
      res.status = 200
    end

    def do_POST(req, res)
      begin
        Appcelerator::Collector.instance.receive JSON.parse(CGI::unescape(req.body))
        res.body = ''
        res.status = 200
      rescue => e
        $stderr.puts "Error: #{e}"
        res.body = 'Server Error'
        res.status = 500
      end
    end
  end
  
  class Agent
    include Singleton
    
    def initialize
    end
    
    def boot

      @config = YAML::load_file 'agent.yml'
      
      #FIXME: set systemid
      
      Appcelerator::Collector.instance.interval=@config[:interval]||300
      Appcelerator::Collector.instance.systemid=@config[:systemid]
      Appcelerator::Collector.instance.endpoint=URI.parse(@config[:server])
      @server = WEBrick::HTTPServer.new(:Port => @config[:port] || 4098, :BindAddress => @config[:bind] || '127.0.0.1')
      @server.mount("/recorder", Servlet)

      info = {'hostname'=>'localhost','ipaddress'=>[],'systemid'=>@config[:systemid]}
      
      if RUBY_PLATFORM =~ /(mswin32|windows)/
        out = %x[ipconfig]
        r = out.grep /IP Address/
        r.each do |line|
          a = line.index ': '
          info['ipaddress'] << line[a+2..-1].strip
        end
      else
        out = %x[ifconfig]
        r = out.grep /inet /
        r.each do |line|
          a = line.index ' '
          b = line.index ' ', a+1
          info['ipaddress'] << line[a..b]
        end
      end

      begin
        info['hostname'] = Socket.gethostname || 'localhost'
      rescue
        # don't allow us to exit even if we can't get the hostname
      end
      
      trap("INT") do
        begin
          # send the agent stop message
          Appcelerator::Collector.instance.transmit('agent.stop',info,false)
        ensure
         @server.shutdown
        end
      end
      
      # send agent start
      Appcelerator::Collector.instance.transmit('agent.start',info,false)

      # now run webrick - this will block until shutdown
      @server.start
    end
  end
end

Appcelerator::Agent.instance.boot
