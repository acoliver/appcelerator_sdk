# Appcelerator SDK
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#

module Appcelerator
  class Python
    def create_project(from_path,to_path)
      
      if not system('python --version')
        puts 'A python interpreter must be installed to use the appcelerator python sdk,'
        puts 'see http://www.python.org/download/ to download for your platform'
        exit 1
      end
      
      Appcelerator::Installer.install_easy_install_if_needed
      Appcelerator::Installer.install_pylons_if_needed
      Appcelerator::Installer.install_appcelerator_egg_if_needed from_path
      
      project_dir = File.dirname to_path
      project_name = File.basename to_path
      
      FileUtils.cd project_dir do
        system("paster create -t pylons #{project_name}")
      end
      
      # copy service directory
      # copy development.ini (where do we put that? it's tied to the server SDK, probably in a directory there)
      # need to copy web files now

      #Appcelerator::Installer.copy(from_path,to_path,["#{__FILE__}"])      
    end
  end
end


