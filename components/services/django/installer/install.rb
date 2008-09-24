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

require File.dirname(__FILE__) + '/plugins/python_config.rb'

module Appcelerator
  class Django
        
    def create_project(from_path,to_path,config,tx)
      
      project_path = to_path
      project_name = config[:name]
      project_location = File.dirname to_path
      
      unless project_name =~ /^[a-zA-Z\d\_]{1,100}$/
        die 'Django projects must have names that match this regex: /^[a-zA-Z\d\_]{1,100}$/'
      end
      
      quiet_system("python django_admin.py startproject #{project_name}")     
       
      FileUtils.cd to_path do
        tx.rm "app" # app create:project makes this

        FileUtils.cp_r(from_path+'/project/.', to_path)
      
        [ "public/appcelerator.xml"
        ].each do |filename|
          edit(tx, File.join(to_path, filename)) do |content|
            content.gsub(/__projectname__/, "#{project_name}")
          end
        end
        edit(tx,File.join(to_path,'urls.py')) do |content|
          # this is mega brittle
          handlers = <<-handlers
              (r'^servicebroker$', 'appcelerator.core.django_servicebroker'),
              (r'^(.*)$', 'django.views.static.serve', {'document_root': './public'}),
          ),
          handlers
          
          content.gsub(/\n\)/, handlers)
        end
      end
      
      Dir["#{from_path}/plugins/*.rb"].each do |fpath|
        fname = File.basename(fpath)
        Installer.copy tx, fpath,"#{to_path}/plugins/#{fname}"
      end
      
      true
    end

    def update_project(from_path,to_path,config,tx,from_version,to_version)
        config[:name] = File.basename(Dir.pwd)
        create_project(from_path,to_path,config,tx)
    end
        
    def check_dependencies(component)
      
      @pyconfig.install_easy_install_if_needed(self)
      @pyconfig.install_appcelerator_egg_if_needed(component[:dir], component[:version])
    end
    
    def initialize
      @pyconfig = PythonConfig.new
    end
    
    #
    # Helpers
    #
    
    def quiet_system(cmd)
      @pyconfig.quiet_system(cmd)
    end
    
    def edit(tx,filename)
      content = File.read(filename)
      content = yield(content)
      tx.put(filename,content)
    end
    
    def assert(test)
      raise "Assertion Failed" unless test
    end
  end
end
