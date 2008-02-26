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

OPTIONS = {}
ARGS = []
action = nil
SCRIPTNAME = File.basename($0)
SCRIPTDIR = File.dirname(__FILE__)
LIB_DIR = "#{SCRIPTDIR}/lib"
RELEASE_DIR = File.join(SCRIPTDIR,'releases')


ARGV.each do |arg|
    case arg
        when /^--/
           t = arg[2..-1].to_s.split('=')
           k = t[0]
           v = t[1] || true
           OPTIONS[k.gsub('-','_').to_sym]=v
        when /^-/
           t = arg[1..-1].to_s.split('=')
           k = t[0]
           v = t[1] || true
           OPTIONS[k.gsub('-','_').to_sym]=v
    else
        ARGS << arg if action
        action = arg unless action        
    end
end

ET_PHONE_HOME = OPTIONS[:server] || 'http://updatesite.appcelerator.org'

#
# load all our core libraries in alpha order
#
Dir["#{SCRIPTDIR}/lib/*.rb"].sort{|a,b| File.basename(a)<=>File.basename(b) }.each do |file|
  puts "Loading library: #{file}" if OPTIONS[:debug]
  require File.expand_path(file)
end

#
# load all our libraries in alpha order
#
Dir["#{SCRIPTDIR}/commands/*.rb"].sort{|a,b| File.basename(a)<=>File.basename(b) }.each do |file|
  require File.expand_path(file)
end

#
# load our plugins
#
Appcelerator::PluginManager.loadPlugins

#
# execute the command
#
if Appcelerator::CommandRegistry.execute(action,ARGS,OPTIONS)
  # indicate a 0 return code so that automated scripts can determine if command succeeded or failed
  exit 0
else
  exit 1
end

