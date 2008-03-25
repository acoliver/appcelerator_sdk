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
],nil,[
  'add:plugin my:plugin',
  'add:plugins my:plugin,your:plugin',
  'add:plugin my:plugin ~/myproject'
]) do |args,options|
  
  pwd = File.expand_path(args[:path] || Dir.pwd)
  force = options[:force]
  force = false if force.nil?
  
  FileUtils.cd(pwd) do 
    # this is used to make sure we're in a project directory
    lang = Project.get_service(pwd)
    
    with_io_transaction(pwd,options[:tx]) do |tx|
      args[:name].split(',').uniq.each do |name|
        class_name = name.gsub(/\/(.?)/) { "::" + $1.upcase }.gsub(/(^|_|:)(.)/) { $2.upcase }
        plugin_name = name.gsub ':', '_'

        plugin = Installer.get_component_from_config(:plugin,name,options[:version])

        if not plugin
          die"Couldn't find plugin named: #{name}."
        end

        plugin_dir,pluginname,version,checksum,already_installed = Installer.install_component(:plugin,'Plugin',name,true,tx,force)
        
        if Project.to_version(plugin[:version]) > Project.to_version(version)
          plugin_dir = Installer.get_release_directory(plugin[:type],plugin[:name],plugin[:version])
          pluginname,version,checksum = plugin[:name],plugin[:version],plugin[:checksum]
          already_installed = true
        end
        
        to_dir = File.expand_path "#{pwd}/plugins/#{plugin_name}"
        tx.mkdir to_dir
        
        event = {:name=>name,:version=>version,:plugin_dir=>plugin_dir,:to_dir=>to_dir,:project_dir=>pwd,:tx=>tx}
        PluginManager.dispatchEvent 'before_add_plugin',event

        config = options[:project_config] || Installer.get_project_config(pwd)
        p = config[:plugins]
        if not p
          p = []
          config[:plugins] = p
        end
        p.delete_if { |w| w[:name] == name } 
        p << {:name=>name,:version=>version}
        Installer.save_project_config(pwd,config) unless options[:no_save]
        
        PluginManager.dispatchEvent 'after_add_plugin',event
        puts "Added Plugin: #{name}, #{version} to project: #{to_dir}" unless OPTIONS[:quiet]
      end
    end
    
  end
  
end
