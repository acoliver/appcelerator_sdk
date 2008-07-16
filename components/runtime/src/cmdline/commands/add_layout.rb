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
CommandRegistry.registerCommand(%w(add:layout add:layouts),'add layout to a project',[
  {
    :name=>'name',
    :help=>'name of the layout to add (such as fixedCenter)',
    :required=>true,
    :default=>nil,
    :type=>Types::AnyType
  },
  {
    :name=>'path',
    :help=>'path of the project to add the layout to',
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
    :help=>'specify a version of the layout to use',
    :value=>true
  }
],[
  'add:layout border',
  'add:layouts border,fixedCenter',
  'add:layout vertical ~/myproject'
]) do |args,options|
  
  pwd = File.expand_path(args[:path] || Dir.pwd)
  config = options[:project_config] || Installer.get_project_config(pwd)
  # this is used to make sure we're in a project directory
  # but only if we didn't pass in path
  Project.get_service(pwd) unless options[:ignore_path_check]
    
  FileUtils.cd(pwd) do 

    with_io_transaction(pwd,options[:tx]) do |tx|
      
      layout_names = args[:name].split(',').uniq
      layout_names.each do |name|
                
        layout = Installer.require_component(:layout, name, options[:version], options)
        layout_name = layout[:name].gsub ':', '_'
        
        to_dir = "#{Dir.pwd}/public/components/layouts/#{layout_name}"
        tx.mkdir to_dir

        event = {:layout_name=>layout[:name],:version=>layout[:version],:layout_dir=>layout[:dir],:to_dir=>to_dir}
        PluginManager.dispatchEvents('add_layout', event) do
          Installer.copy tx, layout[:dir], to_dir

          layouts = config[:layouts] ||= []
          layouts.delete_if { |w| w[:name] == name } 
          layouts << {:name=>layout[:name],:version=>layout[:version]}
        end
        puts "Added #{layout[:name]} #{layout[:version]}" unless OPTIONS[:quiet] or options[:quiet]
      end
      Installer.save_project_config(pwd,config) unless options[:no_save]
    end
    
  end
end
