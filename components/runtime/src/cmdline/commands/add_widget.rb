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
],nil,[
  'add:widget app:message',
  'add:widgets app:iterator,app:box',
  'add:widget app:script ~/myproject'
]) do |args,options|
  
  pwd = File.expand_path(args[:path] || Dir.pwd)
  # this is used to make sure we're in a project directory
  # but only if we didn't pass in path
  lang = Project.get_service(pwd) unless options[:ignore_path_check]
  
  force = options[:force]
  force = false if force.nil?
  
  FileUtils.cd(pwd) do 

    with_io_transaction(pwd,options[:tx]) do |tx|
      args[:name].split(',').uniq.each do |name|
        class_name = name.gsub(/\/(.?)/) { "::" + $1.upcase }.gsub(/(^|_|:)(.)/) { $2.upcase }
        widget_name = name.gsub ':', '_'

        widget = Installer.get_component_from_config(:widget,name,options[:version])

        if not widget
          die "Couldn't find widget named: #{name}."
        end
        
        widget_dir,name,version,checksum,already_installed = Installer.install_component(:widget,'Widget',name,true,tx,force)

        if Installer.should_update(widget[:version],version)
          widget_dir = Installer.get_release_directory(widget[:type],widget[:name],widget[:version])
          name,version,checksum = widget[:name],widget[:version],widget[:checksum]
          already_installed = true
        end
        
        to_dir = "#{Dir.pwd}/public/widgets/#{widget_name}"
        tx.mkdir to_dir

        event = {:widget_name=>widget_name,:version=>version,:widget_dir=>widget_dir,:to_dir=>to_dir}
        PluginManager.dispatchEvents('add_widget', event) do
          Installer.copy tx, widget_dir, to_dir

          config = options[:project_config] || Installer.get_project_config(pwd)
          widgets = config[:widgets] ||= []
          widgets.delete_if { |w| w[:name] == name } 
          widgets << {:name=>name,:version=>version}
          Installer.save_project_config(pwd,config) unless options[:no_save]
        end
        puts "Installed #{name}" unless OPTIONS[:quiet] or options[:quiet]
      end
    end
    
  end
end
