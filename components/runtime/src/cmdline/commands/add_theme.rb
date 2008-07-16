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
  config = options[:project_config] || Installer.get_project_config(pwd)
  # this is used to make sure we're in a project directory
  # but only if we didn't pass in path
  Project.get_service(pwd) unless options[:ignore_path_check]
    
  FileUtils.cd(pwd) do 

    with_io_transaction(pwd,options[:tx]) do |tx|
      
      theme_names = args[:name].split(',').uniq
      theme_names.each do |name|
                
        control = args[:name][0,args[:name].index(':')]
        theme_name = args[:name][args[:name].index(':')+1..-1]

        theme = Installer.require_component(:theme, name, options[:version], options)
        
        to_dir = "#{Dir.pwd}/public/components/#{control}/themes/#{theme_name}"
        tx.mkdir to_dir

        event = {:name=>name,:control=>control,:theme_name=>theme_name,:version=>theme[:version],:theme_dir=>theme[:dir],:to_dir=>to_dir}
        PluginManager.dispatchEvents('add_theme', event) do
          Installer.copy tx, theme[:dir], to_dir

          themes = config[:themes] ||= []
          themes.delete_if { |w| w[:name] == name } 
          themes << {:name=>theme[:name],:version=>theme[:version]}
        end
        puts "Added #{theme[:name]} #{theme[:version]}" unless OPTIONS[:quiet] or options[:quiet]
      end
      Installer.save_project_config(pwd,config) unless options[:no_save]
    end
    
  end
end
