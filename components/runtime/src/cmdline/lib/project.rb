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
  class Project
    def Project.get_language(pwd=Dir.pwd)
      config_file = File.join(pwd,'config','appcelerator.config')

      if not File.exists?(config_file)
        STDERR.puts "This directory doesn't look like an Appcelerator project. Please switch to your project directory and re-run"
        exit 1
      end

      config = YAML.load_file config_file
      config[:language]
    end
    
    def Project.list_installed_components(type)

      puts
      puts "The following #{type} versions are locally installed:"
      puts
      
      count = 0
      
      Installer.each_installed_component(type) do |name,version|
        puts ' ' * 10 + '> ' + name + ' '*(20-name.length) + "[#{version}]"
        count+=1
      end
      
      puts ' ' * 10 + 'None installed' unless count > 0
      
      puts
    end
  end
end