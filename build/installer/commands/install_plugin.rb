# Appcelerator SDK
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#

Appcelerator::CommandRegistry.registerCommand('install:plugin','install a Appcelerator plugin',[
  {
    :name=>'location',
    :help=>'path or URL to plugin file or name of a plugin from the network',
    :required=>true,
    :default=>nil,
    :type=>Appcelerator::Types::StringType
  }
],nil,nil) do |args,options|
  
  location = args[:location]

  temp_dir = nil
  
  if File.exists? location
    if not File.exists?(location)
      STDERR.puts "* Couldn't find plugin at: #{location}"
      exit 1
    end
    
    if not location =~ /(.*)\.zip$/
      STDERR.puts "* Invalid plugin format at: #{location}. Plugins should be in zip format."
      exit 1
    end
    
    plugin_dir = "#{RELEASE_DIR}/plugins/"
    
    # unzip to temporary directory
    temp_dir = Appcelerator::Installer.tempdir
    Appcelerator::Installer.unzip temp_dir, location
    
    puts "extracted plugin into tempdir => #{temp_dir}" if OPTIONS[:debug]
  else
    case location
      when /^http:\/\//
        #TODO: LOAD FROM URL
      when /^\w+[:_]\w+$/
        #TODO: PLUGIN FROM NETWORK
    end
  end
  
  if temp_dir
    if not File.exists?("#{temp_dir}/build.yml")
      STDERR.puts "* Invalid plugin at: #{location}. Plugin missing build.yml"
      exit 1
    end
    
    config = YAML.load_file("#{temp_dir}/build.yml")
    name = config[:name]
    version = config[:version]
    path = "#{plugin_dir}/#{name}/#{version}"
    FileUtils.mkdir_p path unless File.exists?(path)

    Appcelerator::PluginManager.dispatchEvent 'before_install_plugin',location,name,version,path
    
    puts "plugin path => #{path}" if OPTIONS[:debug]
    
    Appcelerator::Installer.copy(temp_dir,path,['build.yml'])
    
    config = {:version=>version}
    Appcelerator::Installer.put "#{plugin_dir}/#{name}/config.yml",config.to_yaml.to_s 
    
    Appcelerator::PluginManager.dispatchEvent 'after_install_plugin',location,name,version,path
    
    puts "Installed Plugin: #{name},#{version}" unless OPTIONS[:quiet]
  end

end
