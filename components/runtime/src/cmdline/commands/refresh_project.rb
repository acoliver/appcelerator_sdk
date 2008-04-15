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
CommandRegistry.registerCommand('refresh:project',
'update project config to include widgets and plugins that have been added manually', [
  {
    :name=>'path',
    :help=>'path of the project',
    :required=>false,
    :default=>nil,
    :type=>[
      Types::FileType,
      Types::DirectoryType,
      Types::AlphanumericType
    ],
    :conversion=>Types::DirectoryType
  }
],nil,nil, :project) do |args,options|

  project_dir = File.expand_path(args[:path] || Dir.pwd)

  FileUtils.cd(project_dir) do 
    lang = Project.get_service(project_dir)
    
    Installer.with_project_config(project_dir) do |config|      
      refresh_components(Dir['public/widgets/*/build.yml'], config[:widgets])          
      refresh_components(Dir['plugins/*/build.yml'], config[:plugins]) # are plugins installed like this?
    end
  end
end

def refresh_components(build_yamls, component_configs)
  build_yamls.each do |build_yaml|
    component_info = YAML::load_file build_yaml
    if not component_in_config(component_configs, component_info[:name])
      puts "Adding #{component_info[:name]} #{component_info[:version]} to config" unless OPTIONS[:quiet]
      component_configs << component_info.clone_keys(:name,:version)
    end
  end
end

def component_in_config(components, name)
  components.each do |cm|
    if cm[:name] == name
      return true
    end
  end
  return false
end
# TODO: this should be moved into the core/lib directory and used most places where we munge the project config

