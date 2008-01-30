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
  class Ruby 
    def create_project(version,from_path,to_path)
      Appcelerator::Installer.install_ruby_gems_if_needed
      Appcelerator::Installer.install_appcelerator_gem_if_needed
      
      #TODO: check for rails
      #TODO: now run rails 
      #TODO: now overlay our files into the project
    end
  end
end


