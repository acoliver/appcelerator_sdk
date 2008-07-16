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
CommandRegistry.registerCommand('install:layout','install a layout',[
  {
    :name=>'location',
    :help=>'path or URL to layout file or name of the layout in the network',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],[
  {
    :name=>'version',
    :display=>'--version=X.X.X',
    :help=>'version of the layout to add',
    :value=>true
  }
],[
  'install:layout my_layout',
  'install:layout my_layout1,my_layout2',
  'install:layout my_layout.zip,your_layout.zip',
  'install:layout http://myurl.com/foo_layout.zip'
]) do |args,options|

  layout_names = args[:location].split(',').uniq
  layout_names.each do |layout|
    Installer.require_component(:layout, layout.strip, options[:version])
  end
end
