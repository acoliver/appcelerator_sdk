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
CommandRegistry.registerCommand(%w(add:plugin add:plugins),'add plugin to a project',[
  {
    :name=>'name',
    :help=>'name of the plugin to add (such as foo:plugin)',
    :required=>true,
    :default=>nil,
    :type=>Types::AnyType
  },
  {
    :name=>'path',
    :help=>'path of the project to add the plugin to',
    :required=>false,
    :default=>nil,
    :type=>[
      Types::FileType,
      Types::DirectoryType,
      Types::AlphanumericType
    ],
    :conversion=>Types::DirectoryType
  }
],[
  {
    :name=>'version',
    :display=>'--version=X.X.X',
    :help=>'version of the plugin to add',
    :value=>true
  }
],[
  'add:plugin my:plugin',
  'add:plugins my:plugin,your:plugin',
  'add:plugin my:plugin ~/myproject'
]) do |args,options|
  
  pwd = File.expand_path(args[:path] || Dir.pwd)
  project = options[:project] || Project.load(pwd)

  plugin_names = args[:name].split(',').uniq

  project.config[:plugins] = [] unless project.config.has_key?(:plugins)
  plugins = project.config[:plugins]
  
  FileUtils.cd(pwd) do 
    # make sure we're in a project directory, unless passing option to skip this test
    Project.get_service(pwd) unless options[:ignore_path_check]
    
    with_io_transaction(projects, options[:tx]) do |tx|
      
      plugin_names.each do |name|
        class_name = name.gsub(/\/(.?)/) { "::" + $1.upcase }.gsub(/(^|_|:)(.)/) { $2.upcase }
        plugin_name = name.gsub ':', '_'

        plugin = Installer.require_component(:plugin,name,options[:version],
          :force=>options[:force], :quiet_if_installed=>true, :tx=>tx)
        
        die "Couldn't find plugin named: #{name}." unless plugin
        
        to_dir = project.get_plugin_path(plugin_name)
        tx.mkdir to_dir
        
        event = {:project=>project, :plugin=>plugin}
        PluginManager.dispatchEvents('add_plugin',event) do
          plugins.delete_if { |w| w[:name] == name } 
          plugins << plugins.clone_keys(:name, :version, :checksum)
        end
        puts "Added Plugin: #{name}, #{plugin[:version]} to project: #{to_dir}" unless OPTIONS[:quiet]
      end
      
      project.save_config() unless options[:no_save]
    end
  end
end
