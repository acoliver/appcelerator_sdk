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

  service_name = args[:service]
  service = Installer.require_component(:service, service_name, options[:version],
              :quiet_if_installed=>true)
  
  die "Couldn't find a service named '#{service_name}'." unless service
  
  puts "Using service #{service[:name]} #{service[:version]}" unless OPTIONS[:quiet]
  
  if OPTIONS[:debug]
    puts "service_dir=#{service[:dir]}"
    puts "name=#{service[:name]}"
    puts "version=#{service[:version]}"
    puts "checksum=#{service[:checksum]}"
  end
  
  from = service[:dir]
  to = File.expand_path(File.join(args[:path].path,args[:name]))
  
  # find the installer script
  script = File.join(from,'install.rb')
   
  # load the create script for the version+language
  require script

  # from and to directories
  service_name = Project.make_service_name(service[:name])
  
  puts "Creating #{service[:name]} project #{service[:version]} from: #{from}, to: #{to}" if OPTIONS[:verbose]
  
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

  event = nil

  with_io_transaction(to) do |tx|
    event = {:project_dir=>to, :service_dir=>from,:name=>args[:name],
             :service=>service[:name], :version=>service[:version], :tx=>tx}
    PluginManager.dispatchEvent 'before_create_project',event
    begin

      config = {
        :name => args[:name],
        :service => service[:name],
        :service_version => service[:version]
      }
      config = Installer.create_project(to, config, tx)

      # now execute the install script
      if service_installer.create_project(from,to,config,tx)
        puts "Appcelerator #{service_name} project created ... !" unless OPTIONS[:quiet]
        success = true
      end
    ensure
      event[:success] = success
    end
  end

  PluginManager.dispatchEvent 'after_create_project',event

  success
end
