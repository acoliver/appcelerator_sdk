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
module Appcelerator
  class Plugin
    def event(name,event)
      if self.respond_to?(:on_event)
        self.send :on_event,event
      end
      if self.respond_to?(name)
        self.send name,event
      end
    end
  end  
  class PluginManager
    @@plugins = Array.new
    def PluginManager.dispatchEvent(name,event)
      puts "--> event => #{name} with #{event.inspect}" if OPTIONS[:debug]
      @@plugins.each do |plugin|
        plugin.event name,event
      end
    end
    def PluginManager.addPlugin(p)
      @@plugins << p
      if p.respond_to? :plugin_registered
        p.send :plugin_registered
      end
    end
    def PluginManager.removePlugin(p)
      @@plugins.remove p
      if p.respond_to? :plugin_unregistered
        p.send :plugin_unregistered
      end
    end
    def PluginManager.loadPlugins(args)
      path = args[:path] || Dir.pwd
      if path 
        path = path.path if path.class==Dir
        if File.exists? path and File.exists? "#{path}/plugins"
          Dir["#{path}/plugins/*"].each do |dir|
            begin
              if File.file?(dir) and File.extname(dir)=='.rb'
                # load plugins in same directory as plugins
                require dir
              elsif File.directory?(dir)
                # load any plugins that are subdirectories under plugins directory
                # as long as the directory name and plugin name are the same
                name = File.dirname(dir)
                prb = "#{dir}/#{name}"
                if File.exists?("#{prb}.rb")
                  require prb
                end
              end
            rescue => e
              STDERR.puts "Error loading plugin: #{name}.  Error: #{e}"
            end
          end
        end
      end
      p = []
      # scan and add all of our plugins
      Object::constants.each do |c|
        cl = eval c
        if cl.class == Class and cl.superclass==Appcelerator::Plugin
          p << cl.to_s
          Appcelerator::PluginManager.addPlugin(cl.new) 
        end
      end
      show = OPTIONS[:debug] and p.length > 0
      name = 'plugin' + (p.length > 1 ? 's' : '')
      puts "--> Loading #{name}: #{p.join(',')}" if show
    end
  end
end
 

Appcelerator::Installer.with_site_config(false) do |config|
  onload = config[:onload]
  if onload
    onload.each do |l|
      next unless l.class == Hash
      path = l[:path]
      next unless File.exists? path
      name = path.gsub('.rb','')
      begin
        require name
      rescue => e
        STDERR.puts "Error loading plugin: #{name}.  Error: #{e}"
      end
    end
  end
end


