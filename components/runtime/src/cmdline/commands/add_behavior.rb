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
CommandRegistry.registerCommand(%w(add:behavior add:behaviors),'add behavior to a project',[
  {
    :name=>'name',
    :help=>'name of the behavior to add (such as resizable)',
    :required=>true,
    :default=>nil,
    :type=>Types::AnyType
  },
  {
    :name=>'path',
    :help=>'path of the project to add the behavior to',
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
    :help=>'specify a version of the behavior to use',
    :value=>true
  }
],[
  'add:behavior resizable',
  'add:behaviors draggable,resizable',
  'add:behavior draggable ~/myproject'
]) do |args,options|
  
  pwd = File.expand_path(args[:path] || Dir.pwd)
  config = options[:project_config] || Installer.get_project_config(pwd)
  # this is used to make sure we're in a project directory
  # but only if we didn't pass in path
  Project.get_service(pwd) unless options[:ignore_path_check]
    
  FileUtils.cd(pwd) do 

    with_io_transaction(pwd,options[:tx]) do |tx|
      
      behavior_names = args[:name].split(',').uniq
      behavior_names.each do |name|
                
        behavior = Installer.require_component(:behavior, name, options[:version], options)
        behavior_name = behavior[:name].gsub ':', '_'
        
        to_dir = "#{Dir.pwd}/public/components/behaviors/#{behavior_name}"
        tx.mkdir to_dir

        event = {:behavior_name=>behavior[:name],:version=>behavior[:version],:behavior_dir=>behavior[:dir],:to_dir=>to_dir}
        PluginManager.dispatchEvents('add_behavior', event) do
          Installer.copy tx, behavior[:dir], to_dir

          config[:behaviors] = [] unless config.has_key?(:behaviors)
          behaviors = config[:behaviors]

          behaviors.delete_if { |w| w[:name] == name } 
          behaviors << {:name=>behavior[:name],:version=>behavior[:version]}
        end
        puts "Added #{behavior[:name]} #{behavior[:version]}" unless OPTIONS[:quiet] or options[:quiet]
      end
      Installer.save_project_config(pwd,config) unless options[:no_save]
    end
    
  end
end
