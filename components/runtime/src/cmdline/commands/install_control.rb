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
CommandRegistry.registerCommand('install:control','install a control',[
  {
    :name=>'location',
    :help=>'path or URL to control file or name of the control in the network',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],[
  {
    :name=>'version',
    :display=>'--version=X.X.X',
    :help=>'version of the control to add',
    :value=>true
  }
],[
  'install:control my_control',
  'install:control my_control1,my_control2',
  'install:control my_control.zip,your_control.zip',
  'install:control http://myurl.com/foo_control.zip'
]) do |args,options|

  control_names = args[:location].split(',').uniq
  control_names.each do |control|
    Installer.require_component(:control, control.strip, options[:version])
  end
end
