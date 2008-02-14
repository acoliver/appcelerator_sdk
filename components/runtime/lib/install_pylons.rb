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
    
    def Installer.install_easy_install_if_needed
      if not system('easy_install --help')
        confirm("Appcelerator requires easy_install to be installed before continuing. Install now? (Y)es, (N)o [Y]")
        
        require 'open-uri'
        require 'tempfile'
        ez_setup_src = open('http://peak.telecommunity.com/dist/ez_setup.py').read
        ez_file = Tempfile.new('ez_setup.py')
        ez_file.write(ez_setup_src)
        ez_file.close
        system("python #{ez_file.path}")
      end
    end

    def Installer.install_pylons_if_needed
      if not system('python -c "import pylons"')
        confirm("Appcelerator requires pylons to be installed before continuing. Install now? (Y)es, (N)o [Y]")
        
        system('easy_install pylons')
      end
    end
  end
end