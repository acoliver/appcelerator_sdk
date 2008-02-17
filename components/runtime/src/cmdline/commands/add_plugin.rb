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
      lang = Appcelerator::Project.get_language(pwd)

      config_file = "#{RELEASE_DIR}/plugins/#{plugin_name}/config.yml"

      if not File.exists?(config_file)
        # TODO: check the network for it
        STDERR.puts "Couldn't find a locally installed plugin named: #{name}. Try to install it first."
        next
      end

      config = YAML.load_file config_file
      version = OPTIONS[:version] || config[:version]
      plugin_dir = "#{RELEASE_DIR}/plugins/#{plugin_name}/#{version}"

      if not File.exists?(plugin_dir)
        # TODO: check the network for it
        STDERR.puts "Couldn't find a locally installed plugin named: #{name} at version: #{version}. Try to install it first."
        next
      end

      to_dir = "#{Dir.pwd}/plugins/#{plugin_name}"
      FileUtils.mkdir_p to_dir unless File.exists?(to_dir)

      Appcelerator::PluginManager.dispatchEvent 'before_add_plugin',plugin_name,version,plugin_dir,to_dir
      Appcelerator::Installer.copy plugin_dir, to_dir
      Appcelerator::PluginManager.dispatchEvent 'after_add_plugin',plugin_name,version,plugin_dir,to_dir

      puts "Installed #{name}" unless OPTIONS[:quiet] or config[:quiet]
    end
  end
  
end
