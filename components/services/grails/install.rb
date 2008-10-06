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


require 'rubygems'
require 'md5'
require 'socket'
require 'erb'

include Appcelerator
module Appcelerator
  class Grails < Project

    @@paths = {
      :services => ["grails-app/services", "Appcelerator services"],
      :tmp => ["tmp", "temporary files"],
      :log => ["log", "logs"],
      :web => ["web-app", "static web files"],
      :grails_plugin => ["plugins", "Grails plugins"]
    }

    def create_project(tx)

      puts "Creating new Grails project using #{from_path}" if OPTIONS[:debug]

      from_path = @service_dir
      
      `"grails create-app #{@path} 2>&1"`

      Installer.copy(tx, "#{from_path}/pieces/grails_plugins", get_path(:grails_plugin))
      Installer.copy(tx, "#{from_path}/pieces/web", get_web_path())

      true
    end
  end
end


