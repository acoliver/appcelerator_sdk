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
    def Installer.create_project(path,name,language,version)
      
      puts "Creating new project at #{path} with name: #{name} for #{language}" if OPTIONS[:debug]
      
      public_path="#{path}/public"

      mkdir %W(#{path}/app/services #{path}/script #{path}/config #{path}/tmp #{path}/log #{path}/plugins)
      mkdir %W(#{public_path}/javascripts #{public_path}/images #{public_path}/stylesheets #{public_path}/swf #{public_path}/modules)

      template_dir = File.join(File.dirname(__FILE__),'templates')
      
      copy "#{template_dir}/COPYING", "#{path}/COPYING"
      copy "#{template_dir}/README", "#{path}/README"
      
      config=Hash.new
      config[:name]=name
      config[:lang_version]=version
      config[:web]="#{public_path}"
      config[:javascript]="#{public_path}/javascripts"
      config[:images]="#{public_path}/images"
      config[:swf]="#{public_path}/swf"
      config[:widgets]="#{public_path}/modules"
      config[:log]="#{path}/log"
      config[:tmp]="#{path}/tmp"
      config[:config]="#{path}/config"
      config[:services]="#{path}/app/services"
      config[:app]="#{path}/app"
      config[:script]="#{path}/script"
      config[:plugin]="#{path}/plugins"
      
      # install the web files
      install_web_project(config)

      # write out our main configuration file
      props = {:installed=>Time.now,:language=>language,:language_version=>version,:web_version=>config[:web_version]}
      
      put "#{path}/config/appcelerator.config", props.to_yaml.to_s
            
      # return our config
      config
    end
    
  end
end

