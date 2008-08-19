#
# This file is part of Appcelerator.
#
# Copyright (c) 2006-2008, Appcelerator, Inc.
# All rights reserved.
# 
# Redistribution and use in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
# 
#     * Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
# 
#     * Redistributions in binary form must reproduce the above copyright notice,
#       this list of conditions and the following disclaimer in the documentation
#       and/or other materials provided with the distribution.
# 
#     * Neither the name of Appcelerator, Inc. nor the names of its
#       contributors may be used to endorse or promote products derived from this
#       software without specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
#

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

      @pyconfig = PythonConfig.new
      install_appcelerator_egg_if_needed(from_path, config[:service_version])
      
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


