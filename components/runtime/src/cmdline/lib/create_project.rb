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

