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
    attr_accessor :service_installer
    attr_accessor :name

    @@paths = {
      :services => ["app/services", "appcelerator services"],
      :scripts => ["scripts", "scripts"],
      :tmp => ["tmp", "temporary files"],
      :log => ["log", "logs"],
      :plugins => ["plugins", "appcelerator plugins"],
      :web => ["public", "static web files"]
    }
    def default_paths
        @@paths
    end
    
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
      project.name = project_name
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

      project.name = config[:name]
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
        service_obj = Appcelerator.const_get(service_type.capitalize).new
      rescue
        die "Couldn't load service object for '#{service_type}-#{service_version}'."
      end

      if is_new and service_obj.respond_to? :check_dependencies
        case service_obj.method(:check_dependencies).arity
          when 0
            service_obj.check_dependencies
          when 1
            service_obj.check_dependencies(service)
          else
            raise "Service class #{service[:name]}-#{service[:version]} " +
                  + 'has method check_dependencies but it requires more '
                  + 'than one argument'
        end
      end

      # old style service
      if not(service_obj.is_a?(Project))
        project = Project.new()
        project.service_installer = service_obj
      else
        project = service_obj
      end

      project.name = config[:name]
      project.service_dir = service[:dir]
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
    def get_behavior_path(behavior)
        get_websdk_path("components/behaviors/#{behavior}")
    end
    def get_control_path(control)
        get_websdk_path("components/controls/#{control}")
    end
    def get_layout_path(layout)
        get_websdk_path("components/layout/#{layout}")
    end
    def get_plugin_path(plugin)
        File.join(get_path(:plugins), plugin)
    end
    def get_theme_path(control_type, control, theme)
        get_websdk_path("components/#{control_type}s/#{control}/themes/#{theme}")
    end
    def get_widget_path(widget)
        get_websdk_path("widgets/#{widget}")
    end
    def get_widgets_path()
        get_websdk_path("widgets")
    end
    
    def create_project_on_disk(tx)

      # creates project directories
      @config[:paths].keys.each { |path_key|
        FileUtils.mkdir_p(get_path(path_key))
      }

      config_dir = "#{@path}/config"
      FileUtils.mkdir_p(config_dir) unless File.exists?(config_dir) 

      template_dir = File.join(File.dirname(__FILE__),'templates')
      Installer.copy(tx, "#{template_dir}/COPYING", "#{@path}/COPYING")
      Installer.copy(tx, "#{template_dir}/README", "#{@path}/README")

      # write out project config here, just in case any commands
      # misbehave and don't try to read the project we pass in
      save_config()
      if not install_websdk_late? and install_websdk?
        Installer.install_websdk(self, tx)
      end

      # now execute the service-specific script (no longer necessary)
      if self.respond_to?(:create_project)
        success = create_project(tx)
      else
        success = service_installer.create_project(@service_dir, @path, @config, tx)
      end
      
      if install_websdk_late? and install_websdk?
        Installer.install_websdk(self, tx)
      end
      
      save_config()

      success
    end
    
    def install_titanium?
      true
    end
    
    def install_websdk?
      true
    end
    
    def install_websdk_late?
      false
    end

    def Project.is_project_dir?(path=Dir.pwd())
      return File.exists?("#{path}/config/appcelerator.config")
    end

    def fill_default_paths()
      if not @config.has_key?(:paths)
        @config[:paths] = {}
      end

      @@paths.each { |key, value|
        if not @config[:paths].has_key?(key)
          @config[:paths][key] = value[0]
        end
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

    def get_websdk_path(rel_path="")
      version = @config[:websdk].split('.')[0].to_i
      
      if version >= 3
          File.join(get_path(:web), "appcelerator", rel_path)
      else
          File.join(get_path(:web), rel_path)
      end
    end

    def save_config()
      puts "saving project config = #{@config_path}" if OPTIONS[:debug]
      Installer.put @config_path, YAML::dump(@config), true
    end

    def update(component, tx)
      from_version = service_version()
      to_version = component[:version]

      service = Installer.require_component(:service,
                                            component[:name],
                                            component[:version], 
                                            :quiet_if_installed=>true)

      begin
        Appcelerator.class_eval do
          remove_const :Java
        end
        GC.start 
        puts "loading: #{service[:dir]}" if OPTIONS[:debug]
        load File.join(service[:dir], 'install.rb') # load service class
        service_obj = Appcelerator.const_get(service[:name].capitalize).new
      rescue
        print "An error occurred: ",$!, "\n"
        die "Couldn't load service object for '#{component[:name]}-#{component[:version]}'."
      end

      if service_obj.is_a?(Project)
        project = service_obj
      else
        project = Project.new
        project.service_installer = service_obj
      end

      project.path = @path
      project.config_path = @config_path
      project.config = {}

      project.config.merge!(@config)
      project.fill_default_paths()
      project.name = @config[:name]

      project.service_dir = service[:dir]
      project.config[:service_version] = service[:version] # might have been nil

      if service_obj.is_a?(Project) and service_obj.respond_to?(:update_project)
        was_ok = project.update_project(from_version, to_version, tx)

      elsif service_obj.is_a?(Project)
        was_ok = project.create_project(tx)

      elsif service_obj.respond_to?(:update_project)
        was_ok = service_obj.update_project(project.service_dir,
                                            project.path,
                                            project.config,
                                            tx,from_version,to_version)
      else
        was_ok = service_obj.create_project(project.service_dir,
                                            project.path,
                                            project.config,tx)
      end

      if was_ok
        puts "Updated service '#{project.service_type()}' to #{to_version}"
      else
        die "Failed to update service '#{project.service_type()}' to #{to_version}"
      end

      project
    end

    def search_and_replace_in_file(file, to_find, to_replace)
      content = File.read(file).gsub!(to_find, to_replace)

      f = File.open(file,'w+')
      f.puts(content)
      f.flush()
      f.close()
      true
    end

    def get_relative_path(from_dir, to_path)
        pp = File.expand_path(@path)
        final = ""

        while (pp != from_dir)
            from_dir = File.expand_path(File.join(from_dir, ".."))
            final = final + "../"
        end

        if not(final.nil?) and final.length > 0
            File.join(final, to_path)
        else
            to_path
        end

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
