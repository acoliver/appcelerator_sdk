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

Appcelerator::CommandRegistry.registerCommand(%w(add:plugin add:plugins),'add plugin to a project',[
  {
    :name=>'name',
    :help=>'name of the plugin to add (such as foo:plugin)',
    :required=>true,
    :default=>nil,
    :type=>Appcelerator::Types::AnyType
  },
  {
    :name=>'path',
    :help=>'path of the project to add the plugin to',
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
  'add:plugin my:plugin',
  'add:plugins my:plugin,your:plugin',
  'add:plugin my:plugin ~/myproject'
]) do |args,options|
  
  pwd = args[:path] || Dir.pwd
  
  FileUtils.cd(pwd) do 
    args[:name].split(',').uniq.each do |name|
      class_name = name.gsub(/\/(.?)/) { "::" + $1.upcase }.gsub(/(^|_|:)(.)/) { $2.upcase }
      plugin_name = name.gsub ':', '_'
      
      # this is used to make sure we're in a project directory
      lang = Appcelerator::Project.get_service(pwd)
      
      plugin = Appcelerator::Installer.get_component_from_config(:plugin,name,options[:version])
      
      if not plugin
        STDERR.puts "Couldn't find plugin named: #{name}."
        exit 1
      end
      
      plugin_dir,pluginname,version,checksum,already_installed = Appcelerator::Installer.install_component(:plugin,'Plugin',name,true)
      
      to_dir = "#{pwd}/plugins/#{plugin_name}"
      FileUtils.mkdir_p to_dir unless File.exists?(to_dir)

      Appcelerator::PluginManager.dispatchEvent 'before_add_plugin',name,version,plugin_dir,to_dir,pwd
      
      Appcelerator::Installer.with_project_config(pwd) do |config|
        p = config[:plugins]
        p.delete_if do |plugin|
          plugin[:name] == name and plugin[:type] == 'plugin'
        end
        p << {:name=>name,:type=>'plugin',:version=>version}
      end

      Appcelerator::PluginManager.dispatchEvent 'after_add_plugin',name,version,plugin_dir,to_dir,pwd
      puts "Installed #{name}" unless OPTIONS[:quiet]
    end
  end
  
end
