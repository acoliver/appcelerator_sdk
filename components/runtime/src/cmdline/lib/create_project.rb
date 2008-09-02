#
# Copyright 2006-2008 Appcelerator, Inc.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#    http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License. 

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
      
      config = Project.get_config(path)
      config[:name] = name
      config[:service_version] = service_version
      config[:service] = service_name
      
      # write out our main configuration file
      props = {
        :name => name,
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

