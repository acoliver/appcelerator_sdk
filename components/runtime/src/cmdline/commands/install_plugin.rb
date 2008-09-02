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


include Appcelerator
CommandRegistry.registerCommand('install:plugin','install a plugin',[
  {
    :name=>'location',
    :help=>'path or URL to plugin file or name of a plugin from the network',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],[
  {
    :name=>'version',
    :display=>'--version=X.X.X',
    :help=>'version of the plugin to install',
    :value=>true
  }
],[
    'install:plugin my:plugin',
    'install:plugin my:plugin,your:plugin',
    'install:plugin http://www.mydir.com/aplugin.zip',
    'install:plugin foo_plugin.zip',
    'install:plugin foo:bar --server=http://localhost:3000'
]) do |args,options|

    args[:location].split(',').uniq.each do |plugin|
      
      component = Installer.require_component(:plugin,plugin.strip,options[:version])
      
      Installer.with_site_config do |config|
        plugin_name = component[:name].gsub(':','_')
        config[:onload] ||= []
        plugin_path = "#{component[:dir]}/#{plugin_name}.rb"
        config[:onload].delete_if { |e| e[:name]==plugin_name }
        config[:onload] << {:name=>plugin_name, :path=>plugin_path}
      end
    end
end

