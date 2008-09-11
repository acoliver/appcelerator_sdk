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
  class Project

    attr_accessor :config
    attr_accessor :path
    attr_accessor :config_path

    def Project.create(path)
      project = Project.new
      project.path = path
      project.make_default_config()
      project.config_path = "#{path}/config/appcelerator.config"

      project
    end

    def Project.load(path=Dir.pwd())

      if not(Project.is_project_dir?(path))
        message = 'This directory doesn\'t look like' +
                  ' an Appcelerator project. Please switch' +
                  ' to your project directory and re-run'
        die message
        #throw :configNotFound
      end

      project = Project.new
      project.path = path
      project.config_path = "#{path}/config/appcelerator.config"

      project.config = YAML::load_file(project.config_path)

      project
    end

    def Project.is_project_dir?(path=Dir.pwd())
      return File.exists?("#{path}/config/appcelerator.config")
    end

    def Project.load_or_create(path=Dir.pwd())
      config_path = "#{path}/config/appcelerator.config"
      if File.exists?(config_path)
        return Project.load(path)
      else
        return Project.create(path)
      end
    end

    def make_default_config
      @config = {
        :paths => {
          :services => "app/services",
          :scripts => "script",
          :config => "config",
          :tmp => "tmp",
          :log => "log",
          :plugins => "plugins",
          :web => "public"
        },
        :plugins => []
      }
    end

    def get_path(path)
      if path.class == String
        return File.join(@path, path)
      elsif path.class == Symbol
        return File.join(@path, @config[:paths][path])
      end
    end

    def get_web_path(rel_path)
      File.join(@path, @config[:paths][:web], rel_path)
    end

    def save_config()
      puts "saving project config = #{dir}" if OPTIONS[:debug]
      Installer.put @config_path, YAML::dump(@config), true
    end

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
