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
CommandRegistry.registerCommand('install:service','install an SOA integration point',[
  {
    :name=>'location',
    :help=>'path or URL to plugin file or name of a service integration from the network',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],[
  {
     :name=>:version,
     :display=>'--version=X.X.X',
     :help=>'version of the service to install',
     :value=>true
  }
],[
  'install:service java',
  'install:service service_java_1.0.zip',
  'install:service http://myurl/service_java.zip',
  'install:service java,ruby'
]) do |args,options|

  stuff = args[:location].split(',').uniq
  stuff.each do |service|
    Installer.require_component(:service, service.strip, options[:version])
  end

end
