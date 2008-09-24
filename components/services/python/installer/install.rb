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


require File.dirname(__FILE__) + '/python_config.rb'

module Appcelerator
  class Python
        
    def create_project(from_path,to_path,config,tx)
                  
      project_path = to_path
      project_name = config[:name]
      app_path = File.join to_path, project_name
      project_location = File.dirname to_path
      
      dependencies = %w(appcelerator simplejson beaker paste python)
      if dependencies.include?(project_name) or not project_name.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/)
        puts "Invalid project name, must be a valid python identifier, and not one of: #{dependencies}"
        return false
      end
      
      FileUtils.cd project_location do
        if not quiet_system("#{paster} create --no-interactive -t pylons #{project_name}")
          puts 'Failure when running "paster", this command creates the pylons project and ought to have been downloaded by the installer'
          return false
        end
      end
      
      Appcelerator::Installer.copy tx, "#{from_path}/services", "#{app_path}/services", nil, true

      copy tx,"#{from_path}/pylons/appcelerator.xml", "#{project_path}/public/appcelerator.xml"
      
      copy tx,"#{from_path}/pylons/development.ini", "#{project_path}/development.ini" do |content|
        content.gsub!(/\$\{(project|package_logger)\}/, project_name)
        content.gsub(/egg:Appcelerator#/, "egg:Appcelerator==#{config[:service_version]}#")
      end
      
      # shuffle into the new public dir
      edit tx, "#{project_path}/MANIFEST.in" do |content|
        content.gsub(/recursive-include .*?\/public/, 'recursive-include public')
      end
      
      edit tx, "#{app_path}/config/middleware.py" do |content|
        static_cascade=<<END_CODE

    import os
    root = config['pylons.paths']['root']
    overroot = os.path.dirname(root)
    appcelerator_static = StaticURLParser(
        os.path.join(overroot,'public'),
        root_directory=overroot
    )

END_CODE
        if content.include?('javascripts_app')
          static_cascade += '    app = Cascade([appcelerator_static, static_app, javascripts_app, app])'
        else
          static_cascade += '    app = Cascade([appcelerator_static, static_app, app])'
        end
        
        # could write a do-block to check and use indentation level
        content.sub(/\s+app = Cascade[^\n]+/, static_cascade)
      end
      
      tx.rm "#{app_path}/public" # pylons makes this
      tx.rm "#{project_path}/app" # appc create:project makes this
      
      Dir["#{from_path}/plugins/*.rb"].each do |fpath|
        fname = File.basename(fpath)
        Installer.copy tx, fpath,"#{to_path}/plugins/#{fname}"
      end
      
      true
    end
    
    # UNTESTED!
    def update_project(from_path,to_path,config,tx,from_version,to_version)
      puts "Updating Python project from #{from_version} to #{to_version}" if OPTIONS[:verbose]

      @pyconfig = PythonConfig.new
      @pyconfig.install_appcelerator_egg_if_needed(from_path, config[:service_version])
      
      project_path = to_path
      project_name = config[:name]
      app_path = config[:project]
      project_location = File.dirname to_path
      
      edit tx, "#{project_path}/development.ini" do |content|
        content.gsub(/egg:Appcelerator==([^#]+)#/) do |match|
          if $1 != from_version
            puts "Upgrading from #{from_version} to #{to_version}, but project seemed to be version #{$1}, how odd."
          end
          "egg:Appcelerator==#{to_version}#"
        end
      end
      
      true
    end
    
    #
    # Helpers
    #
    
    def copy(tx,srcpath,dstpath)
      content = File.read(srcpath)
      content = yield(content) if block_given?
      tx.put(dstpath, content)
    end
    
    def edit(tx,filename)
      content = File.read(filename)
      content = yield(content)
      tx.put(filename,content)
    end
        
    
    #
    # Dependencies
    #
    
    def check_dependencies(component)
      @pyconfig = PythonConfig.new
      
      @pyconfig.install_easy_install_if_needed(self)
      install_pylons_if_needed
      install_paster_if_needed
      @pyconfig.install_appcelerator_egg_if_needed(component[:dir], component[:version])
    end
    
    def install_pylons_if_needed
      # this is taken care of by easy_install, but this gives the user a prompt
      if not quiet_system("#{python} -c \"import pylons\"")
        confirm("Appcelerator:Python requires Pylons to be installed before continuing. Install now? [Yn]")
        quiet_system("#{easy_install} pylons")
      end
    end
    
    def install_paster_if_needed
      paster_cmd = paster
      if not (paster_cmd and quiet_system(paster_cmd))
        confirm("Appcelerator:Python requires PasteScript to be installed before continuing. Install now? [Yn]")
        quiet_system("#{easy_install} pastescript")
      end
    end
        
    require 'forwardable'
    extend Forwardable
    def_delegators :@pyconfig,   :python, :easy_install, :paster, :quiet_system, :on_windows

  end
end


