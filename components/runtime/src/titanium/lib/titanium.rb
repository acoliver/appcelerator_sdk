#
# Copyright 2006-2008 Appcelerator, Inc.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#    http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

require 'socket'
require File.join(SYSTEMDIR, 'lib', 'boot.rb')
require File.join(SYSTEMDIR, 'lib', 'plugin.rb')
require File.join(SYSTEMDIR, 'lib', 'servicebroker_client.rb')

include Appcelerator
include Titanium

def is_mac?
  RUBY_PLATFORM.downcase.include?("darwin")
end

def is_cygwin?
	RUBY_PLATFORM.downcase.include?("cygwin")
end

def is_win?
  RUBY_PLATFORM.downcase.include?("mswin") || is_cygwin?
  
end

def is_linux?
  RUBY_PLATFORM.downcase.include?("linux")
end

def platform_string
  return "osx" if is_mac?
  return "win32" if is_win?
  return "linux" if is_linux?
end

TI_COMPONENT_INFO = {
  :name => "titanium_" + platform_string,
  :type => 'titanium'
}

module Titanium
  class Titanium
    
    def Titanium.create_config_from_dir(dir)
      if Project.is_project_dir?(dir)
        return Titanium.create_config_from_project(Project.load(dir))
      else
        config = {}
        config[:appname] = File.basename(dir)
        config[:title] = File.basename(dir)
        config[:start] = "index.html"
        return config
      end
    end
    
    def Titanium.create_config_from_project(project)
      config = {}
      config[:appname] = project.config[:name]
      config[:title] = project.config[:name]
      config[:start] = "public/index.html"
      return config
    end
    
    def Titanium.get_component_dir
      return Installer.get_component_directory(@@ti_component)
    end
    
    def Titanium.get_support_dir
      return File.join(Installer.get_component_directory(@@ti_component), 'support')
    end
    
    def Titanium.get_app_path
      if is_mac?
        return File.join(Titanium.get_component_dir(), "Titanium.app")
      end
    end
    
    def Titanium.get_executable
    	if is_mac?
    		return File.join(Titanium.get_app_path(), 'Contents', 'MacOS', 'Titanium')
      	elsif is_win?
      		return File.join(Titanium.get_component_dir(), 'ti_shell.exe')
  		end
    end
    
    def Titanium.get_plugin_dir(plugin_component)
      return Installer.get_component_directory(plugin_component)
    end
    
    def Titanium.get_component
      installed_ti = Installer.get_current_installed_component(TI_COMPONENT_INFO)
      if installed_ti.nil?
        Installer.require_component(:titanium, 'titanium_' + platform_string, nil)
        installed_ti = Installer.get_current_installed_component(TI_COMPONENT_INFO)
      end
      
      installed_ti
    end
    
    def Titanium.load_plugins
      require File.join(Installer.get_component_directory(@@ti_component), 'tiplugin.rb')
      
      tiplugins = Installer.installed_components('tiplugin')
      tiplugins.each do |tiplugin|
        latest_plugin = Installer.get_current_installed_component(tiplugin)
        plugin_dir = Installer.get_component_directory(latest_plugin)
        
        plugin_rb = File.join(plugin_dir, 'plugin.rb')
        require File.expand_path(plugin_rb)
      end
      
      p = []
      Object::constants.each do |c|
        cl = Object.const_get(c)
        if cl.class == Class and cl.superclass == Titanium::Plugin
          p << cl.new
        end
      end
      return p
    end
    
    def Titanium.each_plugin
      @@ti_plugins.each do |tiplugin|
        yield tiplugin
      end
    end
    
    def Titanium.init
      Boot.boot
      @@ti_component = Titanium.get_component
      @@ti_plugins = Titanium.load_plugins
    end
  end
end
