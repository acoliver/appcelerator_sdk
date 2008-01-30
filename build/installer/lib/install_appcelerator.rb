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
  class Installer
    
    def Installer.install_appcelerator_gem_if_needed
      begin
        #TODO: check to see if we have the current version in RELEASE variable installed
        require 'appcelerator'
      rescue => e
        require_admin_user
        gem = File.join(RELEASE_DIR,'services/ruby/appcelerator.gem')
        cmd = "gem install #{gem}"
        system cmd
      end
    end
    
    def Installer.install_appcelerator_egg_if_needed
      
      if not system('python -c "import appcelerator"')
        # in reality this probably includes a version number
        egg = File.join(RELEASE_DIR,'services/python/appcelerator.egg')
        system('easy_install #{egg}')
      end
    end
  end
end