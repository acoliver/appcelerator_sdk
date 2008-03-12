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

Appcelerator::CommandRegistry.registerCommand('create:project','create a new project',[
  {
    :name=>'path',
    :help=>'path to directory where project should be created',
    :required=>true,
    :default=>nil,
    :type=>[
      Appcelerator::Types::FileType,
      Appcelerator::Types::DirectoryType,
      Appcelerator::Types::AlphanumericType
    ],
    :conversion=>Appcelerator::Types::DirectoryType
  },
  {
    :name=>'name',
    :help=>'name of the project to create (such as myproject)',
    :required=>true,
    :default=>nil,
    :type=>Appcelerator::Types::StringType
  },
  {
    :name=>'service',
    :help=>'service-specific project to create (such as java)',
    :required=>true,
    :default=>nil,
    :type=>Appcelerator::Types::StringType
  }
],nil,[
  'create:project ~/mypath test java',
  'create:project C:\mydir myproject ruby'
]) do |args,options|


  service_entry = nil
  
  Appcelerator::Installer.with_site_config(false) do |site_config|
    installed = site_config[:installed]
    if installed
      c = installed[:service]
      if c
        c.each do |cm|
            service_entry = cm if cm[:name] == args[:service]
            break if service_entry
        end
      end
    end
  end
  
  if not service_entry
    list = Appcelerator::Installer.fetch_distribution_list
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
  
  puts "service #{service}"


  servicecomponent = Appcelerator::Installer.get_component_from_config(:service,service)

  service_dir,name,version,checksum,already_installed = Appcelerator::Installer.install_component :service,'SOA Integration Point',service,true
  
  if Appcelerator::Project.to_version(servicecomponent[:version]) > Appcelerator::Project.to_version(version)
    service_dir,name,version,checksum,already_installed = Appcelerator::Installer.get_release_directory(servicecomponent[:type],servicecomponent[:name],servicecomponent[:version]),servicecomponent[:name],servicecomponent[:version],servicecomponent[:checksum],true
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
  service_name = Appcelerator::Project.make_service_name(service)
  
  puts "Creating #{service_name} project #{version} from: #{from}, to: #{to}" if OPTIONS[:verbose]
  
  success = false

  with_io_transaction(to) do |tx|
    event = {:project_dir=>to,:service_dir=>from,:name=>args[:name],:service=>service,:version=>version,:tx=>tx}
    Appcelerator::PluginManager.dispatchEvent 'before_create_project',event
    
    config, props = Appcelerator::Installer.create_project(to,args[:name],service,version,tx)
  
    # now execute the install script
    installer = eval "Appcelerator::#{service_name}.new"
    if installer.create_project(from,to,config,tx)
      puts "Appcelerator #{service_name} project created ... !" unless OPTIONS[:quiet]
      success = true
    end
    
    event[:success]=success
    Appcelerator::PluginManager.dispatchEvent 'after_create_project',event
  end

  success
end
