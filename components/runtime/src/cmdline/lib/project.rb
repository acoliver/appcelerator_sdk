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

    def Project.make_service_name(service)
      "#{service[0,1].upcase}#{service[1..-1]}"
    end
    
    def Project.get_service(pwd=Dir.pwd,fail_if_not_found=true)
      config = Installer.get_project_config(pwd)
      service = config[:service]
      if not service and fail_if_not_found
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
      config[:components]="#{public_path}/components"
      config[:layouts]="#{public_path}/components/layouts"
      config[:behaviors]="#{public_path}/components/behaviors"
      config[:controls]="#{public_path}/components/controls"
      config[:project]=path
      config
    end
    
    def Project.list_installed_components(type)
      puts
      puts "The following #{type} versions are locally installed:"
      puts
      
      components = Installer.installed_components(type)
      components.each do |cm|
        puts "          >  #{cm[:name].ljust(32)} [#{cm[:version]}]"
      end
      
      puts "          No #{type}s installed" if components.empty?
      puts
    end
            
    # this may be a ruby builtin somewhere, used to turn generators into arrays
    def Project.from_each(obj, meth, *args)
      result = []
      obj.send(meth,*args) do |e|
        result << e
      end
      result
    end
  end
end