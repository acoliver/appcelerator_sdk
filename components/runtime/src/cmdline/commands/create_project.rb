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
    case service_installer.method :check_dependencies
      # yuck!
      when 0
        service_installer.check_dependencies
      when 1
        service_installer.check_dependencies(service)
    end
  end

  with_io_transaction(to) do |tx|
    event = {:project_dir=>to,:service_dir=>from,:name=>args[:name],
             :service=>service[:name],:version=>service[:version],:tx=>tx}
    PluginManager.dispatchEvent 'before_create_project',event
    begin
            
      config, props = Installer.create_project(to,args[:name],service[:name],service[:version],tx)
  
      # now execute the install script
      if service_installer.create_project(from,to,config,tx)
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
