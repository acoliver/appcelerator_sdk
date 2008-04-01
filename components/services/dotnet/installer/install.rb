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
    def create_project(from_path,to_path,config,tx)
      src_dir = to_path + '/src'
      public_dir = to_path + '/public'
      sb_dir = public_dir + '/bin'
      
      tx.mkdir src_dir
      tx.mkdir public_dir
      tx.mkdir sb_dir
      
      Appcelerator::Installer.copy(tx,from_path,src_dir,["#{__FILE__}",'appcelerator.xml'])
      Appcelerator::Installer.copy(tx,from_path + '/appcelerator.xml',public_dir)
      Appcelerator::Installer.copy(tx,from_path + '/TestService.dll',public_dir + "/../app/services/")
      Appcelerator::Installer.copy(tx,from_path + '/web.config',public_dir)
      Appcelerator::Installer.copy(tx,from_path + '/ServiceBroker.app',public_dir)
      
      #Avoid funky "Error: Is a directory" error
      Appcelerator::Installer.copy(tx,from_path + '/bin/Release/Appcelerator.dll',sb_dir + '/Appcelerator.dll')
      true
    end
  end
end


