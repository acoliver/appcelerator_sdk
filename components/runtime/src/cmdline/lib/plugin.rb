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
    
    def PluginManager.dispatchEvents(nameSuffix,event)
      PluginManager.dispatchEvent('before_'+nameSuffix,event)
      begin
        yield if block_given?
      ensure
        PluginManager.dispatchEvent('after_'+nameSuffix,event)
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
    
    def PluginManager.loadPlugins
      PluginManager.preloadPlugins
      PluginManager.loadPluginsFromPath(File.join(Dir.pwd, 'plugins'))
      PluginManager.loadPluginsFromPath(PLUGINS_DIR)
      p = []
      # scan and add all of our plugins
      Object::constants.each do |c|
        cl = Object.const_get(c)
        if cl.class == Class and cl.superclass==Appcelerator::Plugin
          p << cl.to_s
          Appcelerator::PluginManager.addPlugin(cl.new) 
        end
      end
      show = OPTIONS[:debug] and p.length > 0
      name = 'plugin' + (p.length > 1 ? 's' : '')
      puts "--> Loading #{name}: #{p.join(',')}" if show
    end
    
    def PluginManager.loadPluginsFromPath(path)
      if path 
        path = path.path if path.class==Dir
        if File.exists? path
          Dir["#{path}/*"].each do |dir|
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
    end
    
    def PluginManager.preloadPlugins
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
    end
  end

end
