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
CommandRegistry.registerCommand('create:plugin','create a new plugin project',[
  {
    :name=>'path',
    :help=>'path to directory where plugin project should be created',
    :required=>true,
    :default=>nil,
    :type=>[
      Types::FileType,
      Types::DirectoryType,
      Types::AlphanumericType
    ],
    :conversion=>Types::DirectoryType
  },
  {
    :name=>'name',
    :help=>'name of the plugin to create (such as foo:bar)',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],nil,[
  'create:plugin ~/tmp foo:bar',
  'create:plugin C:\mytemp hello:world',
  'create:plugin . test:plugin'
]) do |args,options|
  
  class_name = args[:name].gsub(/\/(.?)/) { "::" + $1.upcase }.gsub(/(^|_|:)(.)/) { $2.upcase }
  plugin_name = args[:name].gsub ':', '_'
  dir = File.join(args[:path].path,plugin_name)
  
  event = {:plugin_dir=>dir,:name=>args[:name]}
  PluginManager.dispatchEvent('create_plugin',event) do
    
    FileUtils.mkdir_p(dir) unless File.exists?(dir)
    
    template_dir = "#{File.dirname(__FILE__)}/templates"
    
    template = File.read "#{template_dir}/plugin.rb"
    template.gsub! 'ExamplePlugin', class_name
    
    src_dir = "#{dir}/src"
    FileUtils.mkdir_p(src_dir) unless File.exists?(src_dir)
    
    FileUtils.cp "#{template_dir}/LICENSING.readme", "#{dir}/LICENSING.readme"
    Installer.put "#{src_dir}/#{plugin_name}.rb", template
    
    template = File.read "#{template_dir}/plugin_Rakefile"
    template.gsub! 'PLUGIN', plugin_name
    
    build_config = {
      :name=>args[:name],
      :version=>1.0,
      :type=>'plugin',
      :description=>"#{args[:name]} plugin",
      :release_notes=>"initial release",
      :tags=> [],
      :licenses=>[]
    }
    
    Installer.put "#{dir}/Rakefile", template
    Installer.put "#{dir}/build.yml", build_config.to_yaml.to_s
  end
  
  puts "Created Plugin: #{args[:name]} in #{dir}" unless OPTIONS[:quiet]
end
