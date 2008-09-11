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
  project_name = args[:name]
  path = args[:path]

  service = Installer.require_component(:service, service_type, options[:version],
              :quiet_if_installed=>true)

  die "Couldn't find a service named '#{service_type}'." unless service
  service_version = service[:version]
  
  puts "Using service #{service_type} #{service_version}" unless OPTIONS[:quiet]
  
  if OPTIONS[:debug]
    puts "service_dir=#{service[:dir]}"
    puts "name=#{service[:name]}"
    puts "version=#{service[:version]}"
    puts "checksum=#{service[:checksum]}"
  end
  
  from = service[:dir]
  to = File.expand_path(File.join(path.path,project_name))
  
  # find the installer script
  script = File.join(from,'install.rb')
   
  # load the create script for the version+language
  require script

  # from and to directories
  service_name = Project.make_service_name(service[:name])
  
  puts "Creating #{service_name} project from: #{from}, to: #{to}" if OPTIONS[:verbose]
  
  success = false

  service_installer = Appcelerator.const_get(service_name).new

  if service_installer.respond_to? :check_dependencies
    case service_installer.method(:check_dependencies).arity
      when 0
        service_installer.check_dependencies
      when 1
        service_installer.check_dependencies(service)
      else
        raise "Service #{service[:name]} has method 'check_dependencies' but it requires more than one argument"
    end
  end

  if service_installer.respond_to? :default_arguments
    config = service_installer.default_arguments
  else 
    config = {}
  end


  event = {:project_dir=>to,
           :service_dir=>from,
           :name=>project_name,
           :service=>service_type,
           :version=>service_version}

  with_io_transaction(to) do |tx|

    event[:tx] = tx

    PluginManager.dispatchEvents('create_project', event) do

      config = {
        :name => args[:name],
        :service => service[:name],
        :service_version => service[:version]
      }

      project = Project.create(to)
      project.config.merge!(config)

      template_dir = File.join(File.dirname(__FILE__),'templates')
      Installer.copy(tx, "#{template_dir}/COPYING", "#{project.path}/COPYING")
      Installer.copy(tx, "#{template_dir}/README", "#{project.path}/README")

      # write out project config here, just in case any commands
      # misbehave and don't try to read the project we pass in
      project.save_config()
      Installer.install_websdk(project, tx)

      # now execute the service-specific script
      if service_installer.create_project(from,to,config,tx)
        puts "Appcelerator #{service_name} project created ... !" unless OPTIONS[:quiet]
        success = true
      end

      event[:success] = success
    end

  end

  success
end
