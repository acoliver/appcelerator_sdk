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

Appcelerator::CommandRegistry.registerCommand(%w(add:widget add:widgets),'add widget to a project',[
  {
    :name=>'name',
    :help=>'name of the widget to add (such as app:my_widget)',
    :required=>true,
    :default=>nil,
    :type=>Appcelerator::Types::AnyType
  },
  {
    :name=>'path',
    :help=>'path of the project to add the widget to',
    :required=>false,
    :default=>nil,
    :type=>[
      Appcelerator::Types::FileType,
      Appcelerator::Types::DirectoryType,
      Appcelerator::Types::AlphanumericType
    ],
    :conversion=>Appcelerator::Types::DirectoryType
  }
],nil,[
  'add:widget app:message',
  'add:widgets app:iterator,app:box',
  'add:widget app:script ~/myproject'
]) do |args,options|
  
  pwd = File.expand_path(args[:path] || Dir.pwd)
  # this is used to make sure we're in a project directory
  # but only if we didn't pass in path
  lang = Appcelerator::Project.get_service(pwd) unless options[:ignore_path_check]
  
  force = options[:force]
  force = false if force.nil?
  
  FileUtils.cd(pwd) do 

    with_io_transaction(pwd,options[:tx]) do |tx|
      args[:name].split(',').uniq.each do |name|
        class_name = name.gsub(/\/(.?)/) { "::" + $1.upcase }.gsub(/(^|_|:)(.)/) { $2.upcase }
        widget_name = name.gsub ':', '_'

        widget = Appcelerator::Installer.get_component_from_config(:widget,name,options[:version])

        if not widget
          die "Couldn't find widget named: #{name}."
        end
        
        widget_dir,name,version,checksum,already_installed = Appcelerator::Installer.install_component(:widget,'Widget',name,true,tx,force)

        if Appcelerator::Project.to_version(widget[:version]) > Appcelerator::Project.to_version(version)
          widget_dir,name,version,checksum,already_installed = Appcelerator::Installer.get_release_directory(widget[:type],widget[:name],widget[:version]),widget[:name],widget[:version],widget[:checksum],true
        end
        
        to_dir = "#{Dir.pwd}/public/widgets/#{widget_name}"
        tx.mkdir to_dir

        event = {:widget_name=>widget_name,:version=>version,:widget_dir=>widget_dir,:to_dir=>to_dir}
        Appcelerator::PluginManager.dispatchEvent 'before_add_widget', event
        Appcelerator::Installer.copy tx, widget_dir, to_dir

        config = options[:project_config] || Appcelerator::Installer.get_project_config(pwd)
        p = config[:widgets]
        if not p
          p = []
          config[:widgets] = p
        end
        p.delete_if { |w| w[:name] == name } 
        p << {:name=>name,:version=>version}
        Appcelerator::Installer.save_project_config(pwd,config) unless options[:no_save]

        Appcelerator::PluginManager.dispatchEvent 'after_add_widget',event
        puts "Installed #{name}" unless OPTIONS[:quiet] or options[:quiet]
      end
    end
    
  end
end
