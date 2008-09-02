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


module Appcelerator
  class Appengine
        
    def create_project(from_path,to_path,config,tx)
      
      project_name = config[:name]
      
      unless project_name =~ /^(?!-)[a-z\d\-]{1,100}$/
        die 'AppEngine projects must have names that match this regex: /^(?!-)[a-z\d\-]{1,100}$/'
      end
      
      FileUtils.cd to_path do
        
        FileUtils.cp_r(from_path+'/project/.', to_path)
      
        [ "public/appcelerator.xml",
          "launch/proxy.py",
          "launch/servicebroker.py",
          "app.yaml"
        ].each do |filename|
          edit(tx, File.join(to_path, filename)) do |content|
            content.gsub(/__projectname__/, "#{project_name}")
          end
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
    
    #
    # Helpers
    #
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
