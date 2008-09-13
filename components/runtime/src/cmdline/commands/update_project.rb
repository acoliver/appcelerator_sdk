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


include Appcelerator
CommandRegistry.registerCommand('update:project','update project components',[
  {
    :name=>'path',
    :help=>'path of the project',
    :required=>false,
    :default=>nil,
    :type=>[
      Types::FileType,
      Types::DirectoryType,
      Types::AlphanumericType
    ],
    :conversion=>Types::DirectoryType
  }
],nil,[
  'update',
  'update ~/myproject'
], :project) do |args,options|
  
  pwd = args[:path] || Dir.pwd

  FileUtils.cd(pwd) do 

    project = Project.load(pwd)
    
    puts "One moment, determining latest versions ..." if OPTIONS[:verbose]

    updates = []

    config = project.config
      
    websdk_component = {
      :type => :websdk,
      :name => 'websdk',
      :version => config[:websdk],
      :checksum => config[:checksum]
    }
    service_component = {
      :type => :service,
      :name => config[:service],
      :version => config[:service_version],
      :checksum => config[:checksum]
    }

    project_websdk = Installer.get_component(:local, websdk_component) || websdk_component
    project_service = Installer.get_component(:local, service_component) || service_component

    ask_to_update(config[:widgets], updates, :widget)
    ask_to_update(config[:plugins], updates, :plugin)
    ask_to_update([project_websdk, project_service], updates)

    if not updates.empty?
      with_io_transaction(pwd) do |tx|

        config[:last_updated] = Time.now
        event = {
          :project=>project,
          :tx=>tx
        }
        PluginManager.dispatchEvents('update_project',event) do
          opts = {:force=>true,
                  :quiet=>true,
                  :tx=>tx,:ignore_path_check=>true,
                  :no_save=>true,
                  :project=>project}
          updates.each do |component|
            case component[:type].to_sym
            
              when :widget
                opts[:version] = component[:version]
                CommandRegistry.execute('add:widget',[component[:name],pwd],opts)
              
              when :plugin
                opts[:version] = component[:version]
                CommandRegistry.execute('add:plugin',[component[:name],pwd],opts)
            
              when :websdk
                Installer.install_websdk(project, tx, true, component)
                config[:websdk] = component[:version]
              
              when :service
                service = Installer.require_component(:service, component[:name], component[:version], opts)
                
                from_version = config[:service_version]
                to_version = config[:service_version] = component[:version]
                
                service_dir = service[:dir]
                service_name = component[:name].capitalize()
                script = File.join(service_dir,'install.rb')
                puts "attempting to load service install.rb from #{script}" if OPTIONS[:debug]
                project_config = project.config()
                project_config.merge!(config)
                require script
                installer = Appcelerator.const_get(service_name).new
                if installer.respond_to?(:update_project)
                  if installer.update_project(service_dir,pwd,project_config,tx,from_version,to_version)
                    puts "Updated service '#{component[:name]}' to #{to_version}"
                  end
                else
                  if installer.create_project(service_dir,pwd,project_config,tx)
                    puts "Updated service '#{component[:name]}' to #{to_version}"
                  end
                end
            else
              puts "Unknown component type: #{component[:type]}" if OPTIONS[:verbose]
            end
          end
        end

        project.save_config()

      end
    else
      if Installer.logged_in
        puts 'Looks like everything is up-to-date. Cool!'
      else
        puts 'Could not connect to Developer Network, you may be missing updates'
        puts 'This project has up-to-date versions of everything you have installed locally'
      end
    end
  end
end

def ask_to_update(components, updates, type=nil)
  return if components.nil?

  components.each do |project_cm|
    
    project_cm[:type] = type if type
    current = Installer.get_current_available_component(project_cm)
    if current and Installer.should_update(project_cm[:version], current[:version], project_cm[:checksum], current[:checksum])
      
      if OPTIONS[:force_update] or confirm_yes "There is a newer version of '#{project_cm[:name]}' (yours: #{project_cm[:version]}, available: #{current[:version]})  Install? [Yna]"
        puts "Will update to => #{project_cm[:name]} #{current[:version]}" if OPTIONS[:verbose]
        updates << current
      else
        puts "Skipping ... #{project_cm[:name]} #{project_cm[:version]}" if OPTIONS[:verbose]
      end
    elsif OPTIONS[:force_update]
      if confirm_yes "Re-install local version (#{project_cm[:name]} #{project_cm[:version]}). OK? [Yna] "
        puts "Will re-install => #{project_cm[:name]}, #{project_cm[:version]}" if OPTIONS[:verbose]
        updates << project_cm
      end
    else
      description = Installer.describe_component(project_cm)
      puts "#{description} #{project_cm[:name]} is already up-to-date (#{project_cm[:version]})"
    end
  end
  updates
end
