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

module Appcelerator
  class Project

    def Project.make_service_name(service)
      "#{service[0,1].upcase}#{service[1..-1]}"
    end
    
    def Project.get_service(pwd=Dir.pwd,fail_if_not_found=true)
      config = Installer.get_project_config(pwd)
      service = config[:service]
      if not service and fail_if_not_found
        die "This directory doesn't look like an Appcelerator project. Please switch to your project directory and re-run"
      end
      service
    end
    
    def Project.get_config(path)
      config=Hash.new
      public_path = File.expand_path(File.join(path,'public'))
      config[:web]="#{public_path}"
      config[:javascript]="#{public_path}/javascripts"
      config[:images]="#{public_path}/images"
      config[:swf]="#{public_path}/swf"
      config[:widgets]="#{public_path}/widgets"
      config[:stylesheets]="#{public_path}/stylesheets"
      config[:log]="#{path}/log"
      config[:tmp]="#{path}/tmp"
      config[:config]="#{path}/config"
      config[:services]="#{path}/app/services"
      config[:app]="#{path}/app"
      config[:script]="#{path}/script"
      config[:plugin]="#{path}/plugins"
      config[:components]="#{public_path}/components"
      config[:layouts]="#{public_path}/components/layouts"
      config[:behaviors]="#{public_path}/components/behaviors"
      config[:controls]="#{public_path}/components/controls"
      config[:project]=path
      config
    end
    
    def Project.list_installed_components(type)
      puts
      puts "The following #{type} versions are locally installed:"
      puts
      
      components = Installer.installed_components(type)
      components.each do |cm|
        puts "          >  #{cm[:name].ljust(32)} [#{cm[:version]}]"
      end
      
      puts "          No #{type}s installed" if components.empty?
      puts
    end
            
    # this may be a ruby builtin somewhere, used to turn generators into arrays
    def Project.from_each(obj, meth, *args)
      result = []
      obj.send(meth,*args) do |e|
        result << e
      end
      result
    end
  end
end