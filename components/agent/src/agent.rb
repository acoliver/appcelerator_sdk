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
