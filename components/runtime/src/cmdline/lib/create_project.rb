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

    def Installer.create_project(path, config, tx, update=false, webcomponent=nil)

      if OPTIONS[:verbose]
        if update
          puts "Updating project at #{path} with name: #{name} for #{service_name}"
        else
          puts "Creating new project at #{path} with name: #{name} for #{service_name}"
        end
      end

      project = Project.load_or_create(path)

      project.config.merge!(config)

      project.config[:paths].values.each { |rel_path|
        mkdir project.get_path(rel_path)
      }

      mkdir project.get_web_path("javascripts")
      mkdir project.get_web_path("images")
      mkdir project.get_web_path("stylesheets")
      mkdir project.get_web_path("swf")
      mkdir project.get_web_path("widgets")

      template_dir = File.join(File.dirname(__FILE__),'templates')
      copy tx, "#{template_dir}/COPYING", "#{path}/COPYING"
      copy tx, "#{template_dir}/README", "#{path}/README"

      # write out our main configuration file
      Installer.save_project_config path,project.config unless update

      # install the web files
      Installer.install_web_project(project,tx,update,webcomponent)

      # resize to update changes from web
      Installer.save_project_config path,project.config unless update

      return config
    end
    
  end
end

