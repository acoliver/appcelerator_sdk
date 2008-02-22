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


module Appcelerator
  class Dotnet
    def create_project(from_path,to_path,config)
      src_dir = to_path + '/src'
      public_dir = to_path + '/public'
      sb_dir = public_dir + '/bin'
      
      FileUtils.mkdir_p src_dir
      FileUtils.mkdir_p sb_dir
      
      Appcelerator::Installer.copy(from_path,src_dir,["#{__FILE__}",'appcelerator.xml'])
      Appcelerator::Installer.copy(from_path + '/appcelerator.xml',public_dir)
      Appcelerator::Installer.copy(src_dir + '/web.config',public_dir)
      Appcelerator::Installer.copy(src_dir + '/appcelerator-config.xml',sb_dir)
      Appcelerator::Installer.copy(src_dir + '/bin/Release/Appcelerator.dll',sb_dir)
      true
    end
  end
end


