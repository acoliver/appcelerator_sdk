#
# Copyright 2006-2008 Appcelerator, Inc.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#    http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License. 


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

