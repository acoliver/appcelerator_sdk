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

ET_PHONE_HOME = 'http://updatesite.appcelerator.org'
OPTIONS = {}
ARGS = []
ACTION = []
SCRIPTNAME = 'app'
SCRIPTDIR = File.dirname(__FILE__)
LIB_DIR = "#{SCRIPTDIR}/lib"
RELEASE_DIR = File.join(SCRIPTDIR,'releases')

HELP = Hash.new
HELP[:server] = {:display=>'--server=url',:help=>'set location of distribution server. url must be: http://host[:port]',:value=>true}
HELP[:verbose] = {:display=>'--verbose',:help=>'print verbose output as the command is processed',:value=>false}
HELP[:debug] = {:display=>'--debug',:help=>'print very verbose debug output as the command is processed',:value=>false}
HELP[:quiet] = {:display=>'--quiet',:help=>'be silent in printing any output',:value=>false}
HELP[:force] = {:display=>'--force',:help=>'overwrite any existing files during installation',:value=>false}
HELP[:force_update] = {:display=>'--force-update',:help=>'force download of components even if they exist in local cache',:value=>false}
HELP[:args] = {:display=>'--args="args"',:help=>'arguments to pass to calling application',:value=>true}
HELP[:no_remote] = {:display=>'--no-remote',:help=>nil,:value=>true}

def dequote(s)
  return nil unless s
  m = /^['"](.*)["']$/.match(s)
  m ? m[1] : s
end

def parse_options
  current = nil
  win32 = RUBY_PLATFORM=~/(windows|win32)/
  ARGV.each do |arg|
    case arg
      when /^[-]{1,2}/
        if arg.to_s[1,1]=='-'
          t = arg[2..-1].to_s
        else
          t = arg[1..-1].to_s
        end
        i = t.index('=')
        key = (i.nil? ? t : t[0,i]).gsub('-','_')
        value = i.nil? ? nil : t[i+1..-1]
        entry = HELP[key.to_sym] || HELP[key]
        if entry
          if win32 and entry[:value]
	    	    current = key 
	    	    next
          end
          OPTIONS[key.to_sym]=dequote(value)||true
        end
    else
      if win32 and current
        OPTIONS[current.to_sym]=dequote(arg)
        current = nil
        next
      end
      ARGS << arg unless ACTION.empty?
      ACTION << arg if ACTION.empty?        
    end
  end
  if current
   OPTIONS[current.to_sym]=true  
  end
end

def sanitize_options
  OPTIONS[:verbose] = true if OPTIONS[:debug]
  OPTIONS[:quiet] = false if OPTIONS[:verbose]
end


# main

parse_options
sanitize_options

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
if Appcelerator::CommandRegistry.execute(ACTION.first,ARGS,OPTIONS)
  # indicate a 0 return code so that automated scripts can determine if command succeeded or failed
  exit 0
else
  exit 1
end

