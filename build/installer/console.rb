#!/usr/bin/ruby
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



def die(msg)
  STDERR.puts msg
  exit 1
end

def ask_with_validation(q,msg,regexp,mask=false)
  response = nil
  while true
    response = ask(q,mask)
    break if response =~ regexp
    STDERR.puts msg if response
  end
  response
end

def ask(q,mask=false)
  STDOUT.print "#{q} "
  STDOUT.flush
  system 'stty -echo' rescue nil if mask
  answer = ''
  while true
    ch = STDIN.getc
    break if ch==10
    answer << ch
  end
  system 'stty echo' rescue nil if mask
  puts if mask
  answer
end

def confirm(q,canforce=true,die_if_fails=true)
    return if OPTIONS[:force]
    answer = ask(q)
    OPTIONS[:force]=true if canforce and ['A','a'].index(answer)
    if not ['','y','Y','a','A'].index(answer)
      die('Cancelled!') if die_if_fails
      return false
    end
    true
end

#
# set up temp directory and delete it on exit
#
APP_TEMP_DIR=FileUtils.mkdir_p(File.join(ENV['TMPDIR'] || ENV['TEMP'] || ENV['TMP'] || '.',"appcelerator.#{rand($$)}"))
at_exit { FileUtils.rm_rf APP_TEMP_DIR }

module Appcelerator

    module Types
      
      class AnyType
        def is?(value)
          true
        end
      end
      
      class EnumerationType
        def initialize(types)
          @types = types
        end
        def to_s
          "Enumeration of: #{@types.join(' or ')}"
        end
        def is?(value)
          @types.include?(value)
        end
        def convert(value)
          value
        end
      end
      
      class DirectoryType
        def is?(value)
          File.directory?(value) and File.exists?(value)
        end
        def convert(value)
          return Dir.new(value) if File.exists?(value)
          if not OPTIONS[:quiet]
            confirm "Create directory [#{File.expand_path(value)}]? (Y)es,(N)o,(A)ll [Y]"
          end
          FileUtils.mkdir(value)
          Dir.new(value)
        end
      end
      
      class FileType
        def is?(value)
          File.file?(value) and File.exists?(value)
        end
        def convert(value)
          File.new(value)
        end
      end
      
      class NumberType
        def is?(value)
          idx = value =~ /[0-9]+/
          not idx.nil?
        end
        def convert(value)
          value.to_i
        end
      end
      
      class StringType
        def is?(value)
          idx = value =~ /[A-Za-z]+/
          not idx.nil?
        end
        def convert(value)
          value
        end
      end
      
      class AlphanumericType
        def is?(value)
          idx = value =~ /[0-9A-Za-z]+/
          not idx.nil?
        end
        def convert(value)
          value
        end
      end

      class BooleanType
        def is?(value)
          idx = value =~ /(true|false|1|0)/
          not idx.nil?
        end
        def convert(value)
          value == 'true' or value == '1'
        end
      end
      
    end
    
    class CommandRegistry
      @@registry=Hash.new
      
      def CommandRegistry.registerCommand(name,help,args,opts,examples,&callback)
        @@registry[name] = {
          :args=>args,
          :opts=>opts,
          :examples=>examples,
          :invoker=>callback,
          :help=>help
        } unless exists?(name)
      end
      
      def CommandRegistry.exists?(name)
        return false unless name
        not @@registry[name.strip].nil?
      end
      
      def CommandRegistry.find(name)
        return nil unless name
        @@registry[name.strip]
      end
      
      def CommandRegistry.each
        @@registry.sort {|a,b| a[0]<=>b[0]}.each do |k,v|
          yield k,v
        end
      end
      
      def CommandRegistry.execute(name,args=nil,opts=nil)

        info = @@registry[name]

        if not info
          if name=='help'
            return false
          else
            STDERR.puts " *ERROR: Unsupported command: #{name}" if name
            execute('help')
            return false
          end
        end
        
        required_args = info[:args]
        argHash = {}
        error = false
        
        if required_args
          required_args.each_with_index do |arg,index|
            next if error
            if arg[:required] and (not args or args.length < index+1)
              STDERR.puts " *ERROR: Required argument: #{arg[:name]} not found for command: #{name}"
              error = true
              next 
            end
            key = arg[:name].to_sym
            value = args.nil? ? nil : args[index]
            value=arg[:default] unless value
            type = arg[:type]
            typestr = type.to_s.split(':').last
            if type
              if arg[:required] 
                match = false
                case type.class.to_s
                  when 'String'
                    match = isType?(type,value)
                  when 'Class'
                    match = isType?(type,value)
                  when 'Array'
                    type.each do |t|
                      if isType?(t,value)
                        match = true
                        break
                      end
                    end
                else
                  match = type.is?(value)
                  typestr = type.to_s
                end
                if not match
                  STDERR.puts " *ERROR: Invalid argument value: #{value} for argument: #{key}. Must be of type: #{typestr}"
                  exit 1
                end
                if arg[:conversion]
                  value = eval "#{arg[:conversion]}.new.convert('#{value}')"
                end
              end
            end
            argHash[key]=value
          end
        end
        
        if not error
          Appcelerator::Boot.boot unless name=='help'
          Appcelerator::PluginManager.dispatchEvent 'before_command',name,argHash,opts
          info[:invoker].call(argHash,opts)
          Appcelerator::PluginManager.dispatchEvent 'after_command',name,argHash,opts
        else
          execute('help',[name])
          false
        end
      end

      private 

      def CommandRegistry.isType?(type,value)
        expr = "#{type}.new.is?('#{value}')"
        result = eval expr
      end

    end
end

if OPTIONS[:version]
  if not OPTIONS[:version] =~ /[0-9]\.[0-9](\.[0-9])?/
    STDERR.puts "Invalid version format. Must be in the format: X.X.X such as 2.0.1"
    exit 1
  end
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

