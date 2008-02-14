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


Appcelerator::CommandRegistry.registerCommand('list:widgets','list widgets locally installed',nil,nil,nil) do |args,options|
  Appcelerator::Project.list_installed_components 'widgets'
end

Appcelerator::CommandRegistry.registerCommand('list:services','list SOA integrations locally installed',nil,nil,nil) do |args,options|
  Appcelerator::Project.list_installed_components 'services'
end

Appcelerator::CommandRegistry.registerCommand('list:websdks','list web SDKs locally installed',nil,nil,nil) do |args,options|
  Appcelerator::Project.list_installed_sdks
end

Appcelerator::CommandRegistry.registerCommand('list:plugins','list plugins locally installed',nil,nil,nil) do |args,options|
  Appcelerator::Project.list_installed_components 'plugins'
end

Appcelerator::CommandRegistry.registerCommand('list:all','list all locally installed components',nil,nil,nil) do |args,options|
  Appcelerator::Project.list_installed_sdks 
  Appcelerator::Project.list_installed_components 'services'
  Appcelerator::Project.list_installed_components 'plugins'
  Appcelerator::Project.list_installed_components 'widgets'
end
