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
CommandRegistry.registerCommand(%w(add:theme add:themes),'add theme to a project',[
  {
    :name=>'name',
    :help=>'name of the theme to add (such as app:my_theme)',
    :required=>true,
    :default=>nil,
    :type=>Types::AnyType
  },
  {
    :name=>'path',
    :help=>'path of the project to add the theme to',
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
    :help=>'specify a version of the theme to use',
    :value=>true
  }
],[
  'add:theme panel:thinline',
  'add:themes panel:thinline,input:greybox',
  'add:theme panel:foobar ~/myproject'
]) do |args,options|
  
  pwd = File.expand_path(args[:path] || Dir.pwd)
  project = options[:project] || Project.load(pwd)
  # this is used to make sure we're in a project directory
  # but only if we didn't pass in path
  Project.get_service(pwd) unless options[:ignore_path_check]
    
  FileUtils.cd(pwd) do 

    with_io_transaction(pwd,options[:tx]) do |tx|
      
      theme_names = args[:name].split(',').uniq
      theme_names.each do |name|
            
        theme = Installer.require_component(:theme, name, options[:version], options)
        
        control_type = theme[:control]
        control = theme[:name][0,theme[:name].index(':')]
        theme_name = theme[:name][theme[:name].index(':')+1..-1]
        
        to_dir = project.get_theme_path(control_type, control, theme_name)
        tx.mkdir to_dir

        event = {:project=>project, :theme=>theme}
        PluginManager.dispatchEvents('add_theme', event) do
          Installer.copy tx, theme[:dir], to_dir

          project.config[:themes] = [] unless project.config.has_key?(:themes)
          themes = project.config[:themes]

          themes.delete_if { |w| w[:name] == name } 
          themes << theme.clone_keys(:name, :version, :checksum, :control)
        end
        puts "Added #{theme[:name]} #{theme[:version]}" unless OPTIONS[:quiet] or options[:quiet]
      end
      project.save_config() unless options[:no_save]
    end
    
  end
end
