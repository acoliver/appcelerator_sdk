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
  class Java
    def create_project(from_path,to_path,config)
      Appcelerator::Installer.copy(from_path,to_path,["#{__FILE__}"])
      # re-write the application name to be the name of the directory
      name = File.basename(to_path)
      replace_app_name name,"#{to_path}/build.properties"
      replace_app_name name,"#{to_path}/build.xml"
      FileUtils.cp_r "#{from_path}/src/web/appcelerator.xml","#{to_path}/public"
      FileUtils.rm_r "#{to_path}/src/web/appcelerator.xml"
    end
    
    def replace_app_name(name,file)
      content = File.read file
      f = File.open file,'w+'
      content.gsub!('myapp',name)
      f.puts content
      f.flush
      f.close
    end
  end
end


