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

require 'erb'
require 'fileutils'

module Titanium

  class Launcher
    def Launcher.copy_template(template_file, dest, f_binding)
      contents = ''
      File.open(template_file, "r") { |f| contents = f.read }

      template = ERB.new contents
      File.open(dest, 'w') { |f| f.write(template.result(f_binding)) }
    end
    
    def Launcher.launchApp(tiapp_xml)
      cleanup_files = []
      config = {}
      if !File.exists?(tiapp_xml)
        config = Titanium.create_config_from_dir(Dir.pwd)
        
        tiapp_xml = File.join(Dir.pwd, '.tmp_tiapp.xml')
        Launcher.copy_template(File.join(Titanium.get_support_dir(), 'default_tiapp.xml.template'), tiapp_xml, binding)
        cleanup_files << tiapp_xml
      end
      
      FileUtils.chmod 0755, Titanium.get_executable()
      
      command = Titanium.get_executable() + ' --devlaunch --xml ' + tiapp_xml
      
      Titanium.each_plugin do |plugin|
        plugin_dir = Titanium.get_plugin_dir(plugin.component)
        command += " --plugin-#{plugin.name} \"#{plugin_dir}\""
        
        if plugin.has_native_plugin?
          plugins_dir = is_mac? ? File.join(Titanium.get_app_path(), 'Contents', 'Plug-ins') :
            File.join(Titanium.get_component_dir(), 'plugins')
          
          native_plugin = plugin.get_native_plugin()
          native_basename = File.basename(native_plugin)
          native_installpath = File.join(plugins_dir, native_basename)
          
          if is_mac?
            if !File.exists?(native_installpath)
              FileUtils.mkdir_p plugins_dir
              FileUtils.ln_s native_plugin, plugins_dir  
            end
          elsif is_win?
            FileUtils.mkdir_p plugins_dir
            FileUtils.cp native_plugin, plugins_dir
            cleanup_files << native_installpath
          end
        end
      end
      command += " --runtime \"#{Titanium.get_component_dir()}\""
      
      puts command
      system command
      
      FileUtils.rm_r cleanup_files, :force => true
    end
  end
end
