#!/usr/bin/ruby
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
require 'fileutils'
require 'yaml'
require 'open-uri'

OPTIONS = {}
ARGS = []
action = nil
SCRIPTNAME = File.basename($0)
SCRIPTDIR = File.dirname(__FILE__)
LIB_DIR = "#{SCRIPTDIR}/lib"

ET_PHONE_HOME = 'http://localhost:3000'
RELEASE_DIR = File.join(SCRIPTDIR,'releases')


#
# load all our core libraries in alpha order
#
Dir["#{SCRIPTDIR}/lib/*.rb"].sort{|a,b| File.basename(a)<=>File.basename(b) }.each do |file|
  require File.expand_path(file)
end


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

    class Installer
      
      @@client = nil
      @@package_config = nil
      
      def Installer.login(email,password)
        @@client = ServiceBrokerClient.new ET_PHONE_HOME, OPTIONS[:debug]
        result = @@client.send 'account.login.request', {'email'=>email,'password'=>password}
        result[:data]['success']
      end
      
      def Installer.get_latest(name)
        if not @@package_config
          result = @@client.send 'releases.latest.request'
          return nil unless result[:data]['success']
          @@package_config = result[:data]['pkgs']
          puts @@package_config.to_yaml if OPTIONS[:debug]
        end
        @@package_config.each do |pkg|
          if pkg['name'] == name
            return pkg
          end
        end
        nil
      end
      
      def Installer.get_latest_sdk
        get_latest 'web'
      end
      
      def Installer.get_latest_service(lang)
        get_latest lang
      end
      
      def Installer.current_user
        #TODO: windows?
        require 'etc'
        uid=File.stat(APP_TEMP_DIR.to_s).uid
        Etc.getpwuid(uid).name
      end
      
      def Installer.admin_user?
        # ignore for win32 system
        return true if RUBY_PLATFORM =~ /mswin32$/
        
        # must be root user for unix
        un = current_user
        'root'==un
      end
      
      def Installer.require_admin_user
        if not admin_user?
          STDERR.puts
          STDERR.puts "*" * 80
          STDERR.puts
          STDERR.puts "ERROR: Administrative Privileges Required"
          STDERR.puts
          STDERR.puts "This operation requires you to be logged in as root/administrator user."
          STDERR.puts "Please login or sudo as root/administrator and re-run this command again."
          STDERR.puts
          STDERR.puts "*" * 80
          STDERR.puts
          exit 1
        end
      end
      
      def Installer.http_fetch_into(name,url,target)
        temp_dir = http_fetch(name,url)
        if temp_dir
          puts "extracting #{temp_dir} to #{target}" if OPTIONS[:debug]
          FileUtils.cp_r "#{temp_dir}/.", target
          true
        end
        false
      end
      
      def Installer.http_fetch(name,url)
        puts "Attempting to fetch #{name} from #{url}" if OPTIONS[:debug]
        pbar=nil
        dirname=nil
        uri = URI.parse(url)
        home_uri = URI.parse(ET_PHONE_HOME)
        cookies = ''
        if uri.host == home_uri.host and uri.port == home_uri.port
          cookies = @@client.cookies.to_s
        end
        open(url,'Cookie'=>cookies,:content_length_proc => lambda {|t|
              if t && 0 < t
                if not OPTIONS[:quiet]
                  require "#{LIB_DIR}/progressbar"
                  pbar = ProgressBar.new(name, t)
                  pbar.file_transfer_mode
                end
              end
            },
            :progress_proc => lambda {|s|
              pbar.set s if pbar
            }) do |f|
          t = tempfile
          t.write f.read
          t.flush
          t.close
          dirname = File.dirname(t.path)
          if url =~ /\.tgz$/
            #FIXME - deal with windows or bundle in windows or something - or figure out how to do in ruby
            system "tar xfz #{t.path} -C #{dirname}"
          elsif url =~ /\.zip$/
            Installer.unzip dirname,t.path
            FileUtils.rm_r t.path
          end
        end
        puts if pbar
        dirname
      end
      
      def Installer.unzip(dirname,path)
        require 'zip/zip'
        Zip::ZipFile::open(path) do |zf|
          zf.each do |e|
            fpath = File.join(dirname, e.name)
            FileUtils.mkdir_p(File.dirname(fpath))
            puts "extracting ... #{fpath}" if OPTIONS[:debug]
            zf.extract(e, fpath) 
          end
          zf.close
        end
      end
      
      def Installer.tempdir
        FileUtils.mkdir_p File.expand_path(File.join(APP_TEMP_DIR,"#{$$}_#{rand(1000)}"))
      end
      
      def Installer.tempfile
        File.new(File.expand_path(File.join(APP_TEMP_DIR,"#{$$}_#{rand(1000)}")),"w+")
      end

      def Installer.put(path,content)
        f = File.open(path,'w+')
        f.puts content
        f.flush
        f.close
      end

      def Installer.mkdir(path)
        case path.class.to_s
          when 'String'
            FileUtils.mkdir_p path unless File.exists?(path)
          when 'Array'
            path.each do |p|
              mkdir p
            end
        end
      end
      def Installer.copy(from_path,to_path,excludes=nil)
        
        if File.exists?(from_path) and File.file?(from_path)
          FileUtils.cp from_path,to_path
          return true
        end
        
        Dir["#{from_path}/**/*"].each do |file|
          if excludes
            found = false
            excludes.each do |e|
              if file =~ Regexp.new("#{e}$")
                 found = true
                 next
              end
            end
            next if found
          end
          target_file = file.gsub(from_path,'')
          target = File.join(to_path,target_file)
          if File.directory?(file) and not File.exists?(target)
            puts "Creating directory #{target}" if OPTIONS[:verbose]
            FileUtils.mkdir(target)
          end
          if File.file?(file) 
            puts "Copying #{file} to #{target}" if OPTIONS[:verbose]
            confirm("Overwrite [#{target}]? (Y)es,(N)o,(A)ll [Y]") if File.exists?(target) and not OPTIONS[:quiet] and not OPTIONS[:force]
            FileUtils.copy(file,target)
          end
        end
        true
      end
    end

    module Types
      
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
        puts "name=#{name},#{help}"
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
          Appcelerator::Installer.boot unless name=='help'
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

#
# determine all the releases we have installed
#
#Dir["#{SCRIPTDIR}/releases/*"].each do |reldir|
#  if File.directory?(reldir) and File.basename(reldir) =~ /[0-9]\.[0-9](\.[0.9])?/
#    RELEASES << {
#      :version=>File.basename(reldir),
#     :directory=>File.expand_path(reldir),
#      :config=>YAML.load_file("#{reldir}/config.yml")
#    }
#  end
#end

#
# sort in order for newest release to oldest release
#
#RELEASES.sort! do |a,b|
#  b[:version]<=>a[:version]
#end


if OPTIONS[:version]
  if not OPTIONS[:version] =~ /[0-9]\.[0-9](\.[0-9])?/
    STDERR.puts "Invalid version format. Must be in the format: X.X.X such as 2.0.1"
    exit 1
  end
#  if not RELEASES.include?(OPTIONS[:version])
#    require "#{LIB_DIR}/install_version"
#    Appcelerator::Installer.install_version(OPTIONS[:version],"#{File.dirname($0)}/releases/#{OPTIONS[:version]}")
#  end
#  RELEASE = OPTIONS[:version]
#  RELEASES.each do |e| 
#    if e[:version] == OPTIONS[:version]
#      RELEASE_DIR = e[:directory]
#      RELEASE_CONFIG = e[:config]
#    end
#  end
#  if not defined?(RELEASE_CONFIG)
#    STDERR.puts "couldn't find release file config.yml for #{RELEASE}"
#    exit 1
#  end
#else
#  RELEASE = RELEASES.first[:version]
#  RELEASE_DIR = RELEASES.first[:directory]
#  RELEASE_CONFIG = RELEASES.first[:config]
end


#
# load all our libraries in alpha order
#
Dir["#{SCRIPTDIR}/commands/*.rb"].sort{|a,b| File.basename(a)<=>File.basename(b) }.each do |file|
  require File.expand_path(file)
end

#
# execute the command
#
if Appcelerator::CommandRegistry.execute(action,ARGS,OPTIONS)
  # indicate a 0 return code so that automated scripts can determine if command succeeded or failed
  exit 0
else
  exit 1
end

