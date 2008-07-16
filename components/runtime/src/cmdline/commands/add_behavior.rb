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

          behaviors = config[:behaviors] ||= []
          behaviors.delete_if { |w| w[:name] == name } 
          behaviors << {:name=>behavior[:name],:version=>behavior[:version]}
        end
        puts "Added #{behavior[:name]} #{behavior[:version]}" unless OPTIONS[:quiet] or options[:quiet]
      end
      Installer.save_project_config(pwd,config) unless options[:no_save]
    end
    
  end
end
