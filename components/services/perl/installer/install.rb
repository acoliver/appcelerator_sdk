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
  class Perl
    def create_project(from_path,to_path,config,tx)
      Appcelerator::Installer.copy(tx,from_path,to_path, ['install.rb','build.yml'])
      tx.chmod(0755, "#{to_path}/public/servicebroker.pl")     
      tx.chmod(0755, "#{to_path}/public/proxy.pl")     
      true
    end
  end
end


