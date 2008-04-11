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
require 'fileutils'

module Appcelerator
  class Installer
    def Installer.create_project(path,name,service_name,service_version,tx,update=false,webcomponent=nil)
      
      if OPTIONS[:verbose]
        if update
          puts "Updating project at #{path} with name: #{name} for #{service_name}"
        else
          puts "Creating new project at #{path} with name: #{name} for #{service_name}"
        end
      end
      
      public_path="#{path}/public"

      mkdir %W(#{path}/app/services #{path}/script #{path}/config #{path}/tmp #{path}/log #{path}/plugins)
      mkdir %W(#{public_path}/javascripts #{public_path}/images #{public_path}/stylesheets #{public_path}/swf #{public_path}/widgets)

      template_dir = File.join(File.dirname(__FILE__),'templates')
      
      copy tx, "#{template_dir}/COPYING", "#{path}/COPYING"
      copy tx, "#{template_dir}/README", "#{path}/README"
      
      config = Appcelerator::Project.get_config(path)
      config[:name] = name
      config[:service_version] = service_version
      config[:service] = service_name
      
      # write out our main configuration file
      props = {
        :installed=>Time.now,
        :service=>service_name,
        :service_version=>service_version,
        :plugins=>[]
      }
      Installer.save_project_config path,props unless update

      # install the web files
      config = Installer.install_web_project(config,tx,update,webcomponent)

      props[:widgets] = config[:installed_widgets]
      props[:websdk] = config[:websdk]

      # resize to update changes from web
      Installer.save_project_config path,props unless update
      
      return config,props
    end
    
  end
end

