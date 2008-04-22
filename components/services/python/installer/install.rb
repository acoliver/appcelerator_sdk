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

require File.dirname(__FILE__) + '/python_config.rb'

module Appcelerator
  class Python
        
    def create_project(from_path,to_path,config,tx)
                  
      project_path = to_path
      project_name = config[:name]
      app_path = File.join to_path, project_name
      project_location = File.dirname to_path
      
      assert( !(project_name.include?(' ') or project_name.include?(';')))
      FileUtils.cd project_location do
        if not quiet_system("#{paster} create -t pylons #{project_name}")
          puts 'Unable to run "paster", this command creates the pylons project and ought to have been downloaded by the installer'
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
        root_directory=overroot)
    app = Cascade([appcelerator_static, static_app, javascripts_app, app])
END_CODE
        
        # could write a do-block to check and use indentation level
        content.sub(/\s+app = Cascade\(\[static_app, javascripts_app, app\]\)/, static_cascade)
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
      install_appcelerator_egg_if_needed(from_path, config[:service_version])
      
      project_path = to_path
      project_name = config[:name]
      app_path = File.join to_path, project_name
      project_location = File.dirname to_path
      
      edit tx, "#{project_path}/development.ini" do |content|
        content.sub(/egg:Appcelerator==([^#]+)#/) do |match|
          if $1 != from_version
            puts "Upgrading from #{from_version} to #{to_version}, but project seemed to be version #{$1}, how odd."
          end
          "require('Appcelerator==#{to_version}')"
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
    
    def assert(test)
      raise "Assertion Failed" unless test
    end
    
    
    #
    # Dependencies
    #
    
    def check_dependencies(component)
      @pyconfig = PythonConfig.new
      
      install_easy_install_if_needed
      install_pylons_if_needed
      install_paster_if_needed
      install_appcelerator_egg_if_needed(component[:dir], component[:version])
    end
    
    def install_easy_install_if_needed
      if not @pyconfig.easy_install_installed?
        confirm("Appcelerator:Python requires easy_install to be installed before continuing. Install? [Yn]")
        
        require 'open-uri'
        require 'tempfile'
        ez_setup_src = open('http://peak.telecommunity.com/dist/ez_setup.py').read
        ez_file = Tempfile.new('ez_setup.py')
        ez_file.write(ez_setup_src)
        ez_file.close
        
        if on_windows
          quiet_system("#{python} #{ez_file.path}")
        else
          puts "__MAGIC__|ask|Please enter your password to install the python easy_install tool|true|__MAGIC__" if OPTIONS[:subprocess]
          quiet_system("sudo #{python} #{ez_file.path}")
        end
      end
    end
    
    def install_pylons_if_needed
      # this is taken care of by easy_install, but this gives the user a prompt
      if not quiet_system("#{python} -c \"import pylons\"")
        confirm("Appcelerator:Python requires Pylons to be installed before continuing. Install now? [Yn]")
        quiet_system("#{easy_install} pylons")
      end
    end
    
    def install_paster_if_needed
      if not quiet_system(paster)
        confirm("Appcelerator:Python requires PasteScript to be installed before continuing. Install now? [Yn]")
        quiet_system("#{easy_install} pastescript")
      end
    end
    
    def install_appcelerator_egg_if_needed(dir,version)
      appc_version_check = "#{python} -c \"from pkg_resources import require;require('Appcelerator==#{version}')\""
      if not quiet_system(appc_version_check)
        puts "Installing new Appcelerator module" unless OPTIONS[:quiet]
        quiet_system("#{easy_install} \"#{dir}/module/\"")
      end
    end
    
    require 'forwardable'
    extend Forwardable
    def_delegators :@pyconfig,   :python, :easy_install, :paster, :quiet_system, :on_windows

  end
end


