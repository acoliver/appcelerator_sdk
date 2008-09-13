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

    # these properties aren't recorded in the config file
    # thus they may change between project loads
    attr_accessor :config
    attr_accessor :path
    attr_accessor :config_path
    attr_accessor :service_dir

    @@paths = [
      [:services, "app/services", "Appcelerator services"],
      [:scripts, "scripts", "Scripts"],
      [:config, "config", "Appcelerator configuration files"],
      [:tmp, "tmp", "Temporary and working files"],
      [:log, "log", "Program logs"],
      [:plugins, "plugins", "Appcelerator plugins directory"],
      [:web, "public", "Static web files"]
    ]

    def Project.create(path, project_name, service_type, service_version)
      if Project.is_project_dir?(path)
        die 'This directory looks like it\'s already an Appcelerator project.'
      end

      # make a fake config
      config = {
         :name => project_name,
         :service => service_type,
         :service_version => service_version
      }
      project = Project.create_project_object(config)

      project.path = path
      project.config_path = "#{path}/config/appcelerator.config"

      project
    end

    def Project.load(path=Dir.pwd())

      if not(Project.is_project_dir?(path))
        die 'This directory doesn\'t look like' +
            ' an Appcelerator project. Please switch' +
            ' to your project directory and re-run'
        #throw :configNotFound
      end

      config_path = "#{path}/config/appcelerator.config"
      config = YAML::load_file(config_path)

      project = Project.create_project_object(config)

      project.path = path
      project.config_path = config_path
      project
    end

    def Project.create_project_object(config, is_new=true)
      service_type = config[:service]
      service_version = config[:service_version]
      name = config[:name]

      # get the service description
      service = Installer.require_component(:service,
                                            service_type,
                                            service_version,
                                            :quiet_if_installed=>true)
      if not(service)
        die "Couldn't find service description for '#{service_type}-#{service_version}'."
      end
      config[:service_version] = service[:version] # might have been nil

      if OPTIONS[:debug]
        puts "service_dir=#{service[:dir]}"
        puts "name=#{service[:name]}"
        puts "version=#{service[:version]}"
        puts "checksum=#{service[:checksum]}"
      end
      require File.join(service[:dir], 'install.rb') # load service class

      begin
        service_class = Appcelerator.const_get(service_type.capitalize).new
      rescue
        die "Couldn't load service object for '#{service_type}-#{service_version}'."
      end

      if is_new and service_class.respond_to? :check_dependencies
        case service_class.method(:check_dependencies).arity
          when 0
            service_class.check_dependencies
          when 1
            service_class.check_dependencies(service)
          else
            raise "Service class #{service[:name]}-#{service[:version]} " +
                  + 'has method check_dependencies but it requires more '
                  + 'than one argument'
        end
      end

      # old style service
      if not(service.is_a?(Project))
        project = Project.new()
      end

      project.service_dir = service[:directory]
      project.config = config

      # this will cause old projects to
      # end up with default path settings
      project.fill_default_paths()

      project
    end

    def service_version()
        @config[:service_version]
    end
    def service_type()
        @config[:service]
    end


    def create_project_layout()
      @config[:paths].keys.each { |path_key|
        FileUtils.mkdir_p(get_path(path_key))
      }
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

    def fill_default_paths()
      if not @config.has_key?(:paths)
        @config[:paths] = {}
        @@paths.each { |path_desc|
          path_key = path_desc[0]
          path = path_desc[1]
          @config[:paths][path_key] = path
        }
      end
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
      puts "saving project config = #{@config_path}" if OPTIONS[:debug]
      Installer.put @config_path, YAML::dump(@config), true
    end

    def Project.get_service(pwd=Dir.pwd,fail_if_not_found=true)
      config = Installer.get_project_config(pwd)
      service = config[:service]
      if not service and fail_if_not_found
        die "This directory doesn't look like an Appcelerator project. Please switch to your project directory and re-run"
      end
      service
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

  end
end
