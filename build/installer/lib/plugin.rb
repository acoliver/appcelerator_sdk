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
module Appcelerator
  class Plugin
    def event(name,*options)
      puts "--> event => #{name}" if OPTIONS[:debug]
      if self.respond_to?(name)
        self.send name,*options
      end
    end
  end  
  class PluginManager
    @@plugins = Array.new
    def PluginManager.dispatchEvent(name,*options)
      @@plugins.each do |plugin|
        plugin.event name,*options
      end
    end
    def PluginManager.addPlugin(p)
      @@plugins << p
      if p.respond_to? 'plugin_registered'
        p.send 'plugin_registered'
      end
    end
    def PluginManager.removePlugin(p)
      @@plugins.remove p
      if p.respond_to? 'plugin_unregistered'
        p.send 'plugin_unregistered'
      end
    end
    def PluginManager.loadPlugins
      p = []
      # scan and add all of our plugins
      Object::constants.each do |c|
        cl = eval c
        if cl.class == Class and cl.superclass==Appcelerator::Plugin
          p << cl.to_s
          Appcelerator::PluginManager.addPlugin(cl.new) 
        end
      end
      show = OPTIONS[:quiet]==false and p.length > 0
      puts " --> Loading plugin#{p.length > 1 ?'s':''}: #{p.join(',')}" if show
    end
  end
end

PLUGIN_DIR = "#{RELEASE_DIR}/plugins"
PROJECT_PLUGIN_DIR = "#{Dir.pwd}/plugins"

# load all the plugins
[PLUGIN_DIR,PROJECT_PLUGIN_DIR].each do |pdir|
  next unless File.exists?(pdir)
  Dir["#{pdir}/*"].each do |dir|
    if File.directory?(dir) and File.exists?("#{dir}/config.yml")
      config = YAML.load_file("#{dir}/config.yml")
      version = config[:version]
      path = "#{dir}/#{version}/#{File.basename(dir)}.rb"
      require path if File.exists?(path)
    elsif File.file?(dir) and File.extname(dir)=='.rb'
      require dir
    end
  end
end

