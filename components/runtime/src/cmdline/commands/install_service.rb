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


Appcelerator::CommandRegistry.registerCommand('install:service','install an SOA integration point',[
  {
    :name=>'location',
    :help=>'path or URL to plugin file or name of a service integration from the network',
    :required=>true,
    :default=>nil,
    :type=>Appcelerator::Types::StringType
  }
],nil,[
  'install:service java',
  'install:service service_java_1.0.zip',
  'install:service http://myurl/service_java.zip',
  'install:service java,ruby'
]) do |args,options|

  args[:location].split(',').uniq.each do |service|
    Appcelerator::Installer.install_component 'service','SOA Integration Point',service.strip
  end

end
