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
CommandRegistry.registerCommand(%w(add:widget add:widgets),'add widget to a project',[
  {
    :name=>'name',
    :help=>'name of the widget to add (such as app:my_widget)',
    :required=>true,
    :default=>nil,
    :type=>Types::AnyType
  },
  {
    :name=>'path',
    :help=>'path of the project to add the widget to',
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
    :help=>'specify a version of the widget to use',
    :value=>true
  }
],[
  'add:widget app:message',
  'add:widgets app:iterator,app:box',
  'add:widget app:script ~/myproject'
]) do |args,options|
  
  pwd = File.expand_path(args[:path] || Dir.pwd)
  project = options[:project] || Project.load(pwd)

  # this is used to make sure we're in a project directory
  # but only if we didn't pass in path
  Project.get_service(pwd) unless options[:ignore_path_check]
    
  FileUtils.cd(pwd) do 

    with_io_transaction(pwd,options[:tx]) do |tx|
      
      widget_names = args[:name].split(',').uniq
      widget_names.each do |name|
                
        widget = Installer.require_component(:widget, name, options[:version], options)
        widget_name = widget[:name].gsub ':', '_'
        
        to_dir = project.get_widget_path(widget_name)
        tx.mkdir to_dir

        event = {:project=>project, :widget=>widget}
        PluginManager.dispatchEvents('add_widget', event) do
          Installer.copy tx, widget[:dir], to_dir

          project.config[:widgets] = [] unless project.config.has_key?(:widgets)
          widgets = project.config[:widgets]

          widgets.delete_if { |w| w[:name] == name } 
          widgets << widget.clone_keys(:name, :version, :checksum)
        end
        puts "Added #{widget[:name]} #{widget[:version]}" unless OPTIONS[:quiet] or options[:quiet]
      end
      project.save_config() unless options[:no_save]
    end
    
  end
end
