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


require File.dirname(__FILE__) + '/pieces/plugins/python_config.rb'

module Appcelerator
  class Python < Project
    @@paths.merge!({
       :lib => ["lib", "library files"],
       :controllers => ["application/controllers", "Zend Framework controllers includes"],
       :views => ["application/views/scripts", "Zend Framework views"],
       :services => ["application/services", "Appcelerator services"]
    })

    def create_project(tx)
    
      @pyconfig = PythonConfig.new
      @pyconfig.install_easy_install_if_needed(Installer)
      install_pylons_if_needed
      install_paster_if_needed
      @pyconfig.install_appcelerator_egg_if_needed(@service_dir, service_version())
    
      project_name = @config[:name]
      @config[:paths][:services] = File.join(project_name, 'services')

      project_path = @path
      #
      dependencies = %w(appcelerator simplejson beaker paste python)
      if dependencies.include?(project_name) or not project_name.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/)
        puts "Invalid project name, must be a valid python identifier, and not one of: #{dependencies.join(', ')}"
        return false
      end
      
      FileUtils.cd(File.join(@path, '..')) do
        if not quiet_system("#{paster} create --no-interactive -t pylons #{project_name}")
          puts 'Failure when running "paster", this command creates the pylons project and ought to have been downloaded by the installer'
          return false
        end
      end
      
      Installer.copy(tx, "#{@service_dir}/pieces/root", @path, [], true)
      Installer.copy(tx, "#{@service_dir}/pieces/services", get_path(:services), [], true)
      Installer.copy(tx, "#{@service_dir}/pieces/public", get_path(:web), [], true)
      Installer.copy(tx, "#{@service_dir}/pieces/plugins", get_path(:plugins), [], true)

      app_path = get_path(project_name)
      tx.after_tx { 

        f = get_path('development.ini')
        search_and_replace_in_file(f, "__PROJECT_NAME__", @config[:name])
        search_and_replace_in_file(f, "egg:Appcelerator", "egg:Appcelerator==#{service_version()}#")

        f = get_path('MANIFEST.in')
        search_and_replace_in_file(f, /recursive-include .*?\/public/, 'recursive-include public')

        f = File.join(app_path, 'config', 'middleware.py')
        public_rel_path = get_relative_path(app_path, @config[:paths][:web])
        static_cascade=<<END_CODE
    import os
    root = config['pylons.paths']['root']
    overroot = os.path.dirname(root)
    appcelerator_static = StaticURLParser(
        os.path.join(overroot,'#{public_rel_path}'),
        root_directory=overroot
    )

END_CODE
        content = File.read(f)
        if content.include?('javascripts_app')
          static_cascade += '    app = Cascade([appcelerator_static, static_app, javascripts_app, app])'
        else
          static_cascade += '    app = Cascade([appcelerator_static, static_app, app])'
        end

        search_and_replace_in_file(f, /\s+app = Cascade[^\n]+/, static_cascade)

      }

      FileUtils.rm_rf("#{app_path}/public") # pylons makes this

    end

    
    # UNTESTED!
    def update_project(from_version, to_version, tx)
      puts "Updating Python project from #{from_version} to #{to_version}" if OPTIONS[:verbose]

      @pyconfig = PythonConfig.new
      @pyconfig.install_appcelerator_egg_if_needed(@service_dir, config[:service_version])
      
      project_path = to_path
      project_name = config[:name]
      app_path = config[:project]
      project_location = File.dirname to_path
      
      tx.after_tx { 
        f = get_path('development.ini')
        search_and_replace_in_file(f, /egg:Appcelerator==([^#]+)#/, "egg:Appcelerator==#{to_version}#")
      }

      true
    end
    
    #
    # Dependencies
    #
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


