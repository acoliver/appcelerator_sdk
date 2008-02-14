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
  class Installer
    
    def Installer.install_appcelerator_gem_if_needed(dir)
      begin
        require 'appcelerator'
      rescue => e
        require_admin_user
        gem = File.join(dir,'appcelerator.gem')
        cmd = "gem install #{gem}"
        system cmd
      end
    end
    
    def Installer.install_appcelerator_egg_if_needed(dir)
      if not system('python -c "import appcelerator"')
        # in reality this probably includes a version number
        egg = File.join(dir,'appcelerator.egg')
        system "easy_install #{egg}"
      end
    end
  end
end