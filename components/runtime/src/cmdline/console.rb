#!/usr/bin/env ruby
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
require 'fileutils'
require 'yaml'
require 'open-uri'

Signal.trap("INT") { puts; exit }

ET_PHONE_HOME = 'http://updatesite.appcelerator.org'
OPTIONS = {}
ARGS = []
SCRIPTNAME = 'app'
SCRIPTDIR = File.dirname(__FILE__)
LIB_DIR = "#{SCRIPTDIR}/lib"
RELEASE_DIR = File.join(SCRIPTDIR,'releases')
PLUGINS_DIR = File.join(SCRIPTDIR,'lib','plugins')
OPTIONS[:subprocess] = (ARGV.include? '--subprocess') # bootstrapping

GLOBAL_OPTS = {
  :verbose => {
      :display => '--verbose',
      :help    => 'print verbose output as the command is processed',
      :value   => false},
  :debug => {
      :display => '--debug',
      :help    => 'print very verbose debug output as the command is processed',
      :value   => false},
  :quiet => {
      :display => '--quiet',
      :help    => 'be silent in printing any output',
      :value   => false},
  :force => {
      :display => '--force',
      :help    => 'overwrite any existing files during installation',
      :value   => false},
  :force_update => {
      :display => '--force-update',
      :help    => 'force download of components even if they exist in local cache',
      :value   => false},
  :args => {
      :display => '--args="args"',
      :help    => 'arguments to pass to calling application',
      :value   => true},
  :server => {
      :display => '--server=url',
      :help    => 'set location of distribution server. url must be: http://host[:port]',
      :value   => true},
  :no_remote => {
      :display => '--no-remote',
      :help    => 'avoid making network connections, may disable some commands',
      :value   => false}
}

def dequote(s)
  return nil unless s
  m = /^['"](.*)["']$/.match(s)
  m ? m[1] : s
end

def parse_options_windows
  # thank you for spliting on spaces and equals-signs, cmd.exe
  current = nil
  ARGV.each do |arg|
    if arg =~ /^--?(.+)$/
      key = $1.gsub('-','_').to_sym # first matched group of the regex
    
      OPTIONS[key] = true if key
      current = key
    else
      if current and (not GLOBAL_OPTS[current] or GLOBAL_OPTS[current][:value] == true)
        # only do this is the option is unknown, or known and requires a value
        OPTIONS[current] = dequote(arg)
        current = nil
      else
        ARGS << arg
      end
    end
  end
end

def parse_options_unix
  ARGV.each do |arg|
    if arg =~ /^--?([^=]+)(=(.+))?$/
      
      value = $3 # matching group after the equals-sign
      key = $1.gsub('-','_').to_sym # matching group between the dash(es) and equals-sign
      
	    OPTIONS[key] = dequote(value) || true
    else
      ARGS << arg
    end
  end
end

def sanitize_options
  OPTIONS[:verbose] = true if OPTIONS[:debug]
  OPTIONS[:quiet] = false if OPTIONS[:verbose]
end


# main

# The person running us as a subprocess is probably the IDE,
# in which case we assume that he knows how to chop up a commandline
if RUBY_PLATFORM=~/(windows|win32)/ and not OPTIONS[:subprocess]
  parse_options_windows
else
  parse_options_unix
end
ACTION = ARGS.shift
sanitize_options

# Override open uri to include support for authenticated proxies

def OpenURI.open_http(buf, target, proxy, options) # :nodoc:
  if proxy
    raise "Non-HTTP proxy URI: #{proxy}" if proxy.class != URI::HTTP
  end

  if target.userinfo && "1.9.0" <= RUBY_VERSION
    # don't raise for 1.8 because compatibility.
    raise ArgumentError, "userinfo not supported.  [RFC3986]"
  end

  require 'net/http'
  klass = Net::HTTP
  if URI::HTTP === target
    # HTTP or HTTPS
    if proxy
      proxy_user, proxy_pass = proxy.userinfo.split(/:/) if proxy.userinfo
      klass = Net::HTTP::Proxy(proxy.host, proxy.port, proxy_user, proxy_pass)
    end
    target_host = target.host
    target_port = target.port
    request_uri = target.request_uri
  else
    # FTP over HTTP proxy
    target_host = proxy.host
    target_port = proxy.port
    request_uri = target.to_s
  end

  http = klass.new(target_host, target_port)
  if target.class == URI::HTTPS
    require 'net/https'
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_PEER
    store = OpenSSL::X509::Store.new
    store.set_default_paths
    http.cert_store = store
  end

  header = {}
  options.each {|k, v| header[k] = v if String === k }

  resp = nil
  http.start {
    if target.class == URI::HTTPS
      # xxx: information hiding violation
      sock = http.instance_variable_get(:@socket)
      if sock.respond_to?(:io)
        sock = sock.io # 1.9
      else
        sock = sock.instance_variable_get(:@socket) # 1.8
      end
      sock.post_connection_check(target_host)
    end
    req = Net::HTTP::Get.new(request_uri, header)
    if options.include? :http_basic_authentication
      user, pass = options[:http_basic_authentication]
      req.basic_auth user, pass
    end
    http.request(req) {|response|
      resp = response
      if options[:content_length_proc] && Net::HTTPSuccess === resp
        if resp.key?('Content-Length')
          options[:content_length_proc].call(resp['Content-Length'].to_i)
        else
          options[:content_length_proc].call(nil)
        end
      end
      resp.read_body {|str|
        buf << str
        if options[:progress_proc] && Net::HTTPSuccess === resp
          options[:progress_proc].call(buf.size)
        end
      }
    }
  }
  io = buf.io
  io.rewind
  io.status = [resp.code, resp.message]
  resp.each {|name,value| buf.io.meta_add_field name, value }
  case resp
  when Net::HTTPSuccess
  when Net::HTTPMovedPermanently, # 301
       Net::HTTPFound, # 302
       Net::HTTPSeeOther, # 303
       Net::HTTPTemporaryRedirect # 307
    throw :open_uri_redirect, URI.parse(resp['location'])
  else
    raise OpenURI::HTTPError.new(io.status.join(' '), io)
  end
end
#
# load all our core libraries in alpha order
#
Dir["#{SCRIPTDIR}/lib/*.rb"].sort{|a,b| File.basename(a)<=>File.basename(b) }.each do |file|
  next if file=~/^_/ # don't auto-load _ files
  puts "Loading library: #{file}" if OPTIONS[:debug]
  require File.expand_path(file)
end

#
# load all our user commands in alpha order
#
Dir["#{SCRIPTDIR}/commands/*.rb"].sort{|a,b| File.basename(a)<=>File.basename(b) }.each do |file|
  require File.expand_path(file)
end

Appcelerator::PluginManager.loadPlugins
#
# execute the command
#
if Appcelerator::CommandRegistry.execute(ACTION,ARGS,OPTIONS) == false
  # tell parent process that something went wrong
  exit 1
else
  exit 0
end

