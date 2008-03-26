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

    ###
    # TODO: anything that uses this needs to be refactored to use Project.compare_version
    ###
    def Project.to_version(v)
      return 0 unless v
      v.to_s.gsub('.','').to_i
    end
    
    def Project.compare_version(first, second)
      return 0 unless (first and second)
      first.split('.') <=> second.split('.')
    end

    def Project.make_service_name(service)
      "#{service[0,1].upcase}#{service[1..-1]}"
    end
    
    def Project.get_service(pwd=Dir.pwd)
      config = Installer.get_project_config(pwd)
      service = config[:service]
      if not service
        die "This directory doesn't look like an Appcelerator project. Please switch to your project directory and re-run"
      end
      service
    end
    
    def Project.get_config(path)
      config=Hash.new
      public_path = File.expand_path(File.join(path,'public'))
      config[:web]="#{public_path}"
      config[:javascript]="#{public_path}/javascripts"
      config[:images]="#{public_path}/images"
      config[:swf]="#{public_path}/swf"
      config[:widgets]="#{public_path}/widgets"
      config[:stylesheets]="#{public_path}/stylesheets"
      config[:log]="#{path}/log"
      config[:tmp]="#{path}/tmp"
      config[:config]="#{path}/config"
      config[:services]="#{path}/app/services"
      config[:app]="#{path}/app"
      config[:script]="#{path}/script"
      config[:plugin]="#{path}/plugins"
      config[:project]=path
      config
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