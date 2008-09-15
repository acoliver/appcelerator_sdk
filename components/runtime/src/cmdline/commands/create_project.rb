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
CommandRegistry.registerCommand('create:project','create a new project',[
  {
    :name=>'path',
    :help=>'path to directory where project should be created',
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
    :help=>'name of the project to create (such as myproject)',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  },
  {
    :name=>'service',
    :help=>'service-specific project to create (such as java)',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],nil,[
  'create:project ~/mypath test java',
  'create:project C:\mydir myproject ruby'
]) do |args,options|


  service_type = args[:service]
  service_version = args[:version]
  project_name = args[:name]
  path = args[:path]

  to = File.expand_path(File.join(path.path,project_name))
  puts "Using service #{service_type} #{service_version}" unless OPTIONS[:quiet]
  puts "Creating #{service_type}-#{service_version} project from: #{from}, to: #{to}" if OPTIONS[:verbose]

  success = true
  project = Project.create(to, project_name, service_type, service_version)

  with_io_transaction(to) do |tx|

    event = {:project=>project, :tx=>tx}
    PluginManager.dispatchEvents('create_project', event) do

      project.create_project_layout() # creates project directories
      template_dir = File.join(File.dirname(__FILE__),'templates')
      Installer.copy(tx, "#{template_dir}/COPYING", "#{project.path}/COPYING")
      Installer.copy(tx, "#{template_dir}/README", "#{project.path}/README")

      # write out project config here, just in case any commands
      # misbehave and don't try to read the project we pass in
      project.save_config()
      Installer.install_websdk(project, tx)

      # now execute the service-specific script (no longer necessary)
      if project.respond_to?(:create_project)
        success = project.create_project(tx)
      else
        success = project.service_installer.create_project(project.service_dir, project.path, project.config, tx)
      end

      project.save_config()
      if success
          puts "Appcelerator #{project.service_type} project created ... !" unless OPTIONS[:quiet]
      end

      event[:success] = success
    end

  end

  success
end
