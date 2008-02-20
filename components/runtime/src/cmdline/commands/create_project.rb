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
  
  # determine if we have the service the user is asking for
  list = Appcelerator::Installer.fetch_distribution_list
  list[:service].each do |svc|
    if args[:service] == svc[:name]
      service_entry = svc
      break
    end
  end
  
  if not service_entry
    STDERR.puts "Couldn't find a service named #{args[:service]}."
    exit 1
  end
  
  service = service_entry[:name]
  
  service_dir,name,version,checksum,already_installed = Appcelerator::Installer.install_component :service,'SOA Integration Point',service,true
  
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
  service_name = "#{service[0,1].upcase}#{service[1..-1]}"
  
  puts "Creating #{service_name} project #{version} from: #{from}, to: #{to}" if OPTIONS[:verbose]
  
  # use our helper
  Appcelerator::PluginManager.dispatchEvent 'before_create_project',to,from,args[:name],service,version
  config = Appcelerator::Installer.create_project(to,args[:name],service,version)
  
  # now execute the install script
  installer = eval "Appcelerator::#{service_name}.new"
  success = false
  if installer.create_project(from,to,config)
    puts "Appcelerator #{service_name} project created ... !" unless OPTIONS[:quiet]
    success = true
  end

  Appcelerator::PluginManager.dispatchEvent 'after_create_project',config,success
  success
end
