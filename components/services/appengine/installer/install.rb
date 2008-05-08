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
  class Appengine
        
    def create_project(from_path,to_path,config,tx)
      
      project_name = config[:name]
      
      assert( !(project_name.include?(' ') or project_name.include?(';')))
      FileUtils.cd to_path do
        
        # iotx is nonsense
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
