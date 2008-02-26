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


Appcelerator::CommandRegistry.registerCommand(%w(list:widgets list:widget),'list widgets locally installed',nil,nil,nil) do |args,options|
  Appcelerator::Project.list_installed_components 'widget'
end

Appcelerator::CommandRegistry.registerCommand(%w(list:services list:service),'list SOA integrations locally installed',nil,nil,nil) do |args,options|
  Appcelerator::Project.list_installed_components 'service'
end

Appcelerator::CommandRegistry.registerCommand(%w(list:websdks list:websdk),'list web SDKs locally installed',nil,nil,nil) do |args,options|
  Appcelerator::Project.list_installed_components 'websdk'
end

Appcelerator::CommandRegistry.registerCommand(%w(list:plugins list:plugin),'list plugins locally installed',nil,nil,nil) do |args,options|
  Appcelerator::Project.list_installed_components 'plugin'
end

Appcelerator::CommandRegistry.registerCommand(%w(list:all list),'list all locally installed components',nil,nil,nil) do |args,options|
  Appcelerator::Project.list_installed_components 'websdk' 
  Appcelerator::Project.list_installed_components 'service'
  Appcelerator::Project.list_installed_components 'plugin'
  Appcelerator::Project.list_installed_components 'widget'
end
