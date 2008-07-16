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
CommandRegistry.registerCommand('install:theme','install a theme',[
  {
    :name=>'location',
    :help=>'path or URL to theme file or name of the theme in the network. If the theme is a name of theme, must be in the format control:theme',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],[
  {
    :name=>'version',
    :display=>'--version=X.X.X',
    :help=>'version of the theme to add',
    :value=>true
  }
],[
  'install:theme input:my_theme',
  'install:theme select:my_theme1,panel:my_theme2',
  'install:theme my_theme.zip,your_theme.zip',
  'install:theme http://myurl.com/foo_theme.zip'
]) do |args,options|

  theme_names = args[:location].split(',').uniq
  theme_names.each do |theme|
    Installer.require_component(:theme, theme.strip, options[:version])
  end
end
