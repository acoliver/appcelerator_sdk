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

# FIXME - this needs to come from the network
languages = ['java','ruby','python','perl','dotnet','ruby']

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
    :help=>'name of the project to create (such as helloworld)',
    :required=>true,
    :default=>nil,
    :type=>Appcelerator::Types::StringType
  },
  {
    :name=>'language',
    :help=>'language-specific project to create (such as java)',
    :required=>true,
    :default=>nil,
    :type=>Appcelerator::Types::EnumerationType.new(languages),
    :conversion=>Appcelerator::Types::StringType
  }
],nil,nil) do |args,options|

  # figure out path to language directory
  lang_dir = File.join(RELEASE_DIR,'services',args[:language])

  # install the actual service bundle if needed
  service_dir = Appcelerator::Installer.install_service_if_required(args[:language],lang_dir)
  version = File.basename(service_dir)
  
  # find the installer script
  script = File.join(service_dir,'install.rb')

  # load the create script for the version+language
  require script
  
  # from and to directories
  from = service_dir
  to = File.expand_path(File.join(args[:path].path,args[:name]))
  lang = "#{args[:language][0,1].upcase}#{args[:language][1..-1]}"

  puts "Creating #{lang} project #{version} from: #{from}, to: #{to}" if OPTIONS[:verbose]

  # use our helper
  Appcelerator::PluginManager.dispatchEvent 'before_create_project',to,from,args[:name],args[:language],version
  config = Appcelerator::Installer.create_project(to,args[:name],args[:language],version)
  
  # now execute the install script
  installer = eval "Appcelerator::#{lang}.new"
  if installer.create_project(from,to,config)
    puts "Appcelerator #{lang} project created ... !"
    Appcelerator::PluginManager.dispatchEvent 'after_create_project',config
    true
  end
end
