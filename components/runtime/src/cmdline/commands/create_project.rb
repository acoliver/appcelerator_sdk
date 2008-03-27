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


  service_entry = nil
  
  # find the service in the local config (refactor this)
  Installer.with_site_config(false) do |site_config|
    installed = site_config[:installed] || {}
    components = installed[:service] || []
    components.each do |cm|
      if cm[:name] == args[:service]
        service_entry = cm
        break
      end
    end
  end
  
  if not service_entry
    list = Installer.fetch_distribution_list
    list[:service].each do |svc|
      if args[:service] == svc[:name]
        service_entry = svc
        break
      end
    end
  end
  
  if not service_entry
    die "Couldn't find a service named #{args[:service]}."
  end
  
  service = service_entry[:name]
  
  puts "service #{service}" unless OPTIONS[:quiet]


  servicecomponent = Installer.get_component_from_config(:service,service)

  service_dir,name,version,checksum,already_installed = Installer.install_component :service,'SOA Integration Point',service,true
  
  if Installer.should_update(servicecomponent[:version], version)
    service_dir = Installer.get_release_directory(servicecomponent[:type],servicecomponent[:name],servicecomponent[:version])
    name,version,checksum = servicecomponent[:name],servicecomponent[:version],servicecomponent[:checksum]
    already_installed = true
  end

  if OPTIONS[:debug]
    puts "service_dir=#{service_dir}"
    puts "name=#{name}"
    puts "version=#{version}"
    puts "checksum=#{checksum}"
    puts "already_installed=#{already_installed}"
  end
  
  # find the installer script
  script = File.join(service_dir,'install.rb')
   
  # load the create script for the version+language
  require script

  # from and to directories
  from = service_dir
  to = File.expand_path(File.join(args[:path].path,args[:name]))
  service_name = Project.make_service_name(service)
  
  puts "Creating #{service_name} project #{version} from: #{from}, to: #{to}" if OPTIONS[:verbose]
  
  success = false

  with_io_transaction(to) do |tx|
    event = {:project_dir=>to,:service_dir=>from,:name=>args[:name],:service=>service,:version=>version,:tx=>tx}
    PluginManager.dispatchEvent 'before_create_project',event
    begin
    
      config, props = Installer.create_project(to,args[:name],service,version,tx)
  
      # now execute the install script
      installer = Appcelerator.const_get(service_name).new
      if installer.create_project(from,to,config,tx)
        puts "Appcelerator #{service_name} project created ... !" unless OPTIONS[:quiet]
        success = true
      end
      
    ensure
      event[:success] = success
      PluginManager.dispatchEvent 'after_create_project',event
    end
  end

  success
end
