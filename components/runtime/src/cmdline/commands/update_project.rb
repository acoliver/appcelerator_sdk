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

    # this is used to make sure we're in a project directory
    lang = Project.get_service(pwd)

    # determine if we have the service the user is asking for
    list = Installer.fetch_distribution_list

    puts "One moment, determining latest versions ..." if OPTIONS[:verbose]

    updates = []

    Installer.with_project_config(pwd,false) do |config|

      config[:widgets].each do |widget|
        widget_component = Installer.get_component_from_config(:widget,widget[:name])
        
        if widget_component and Installer.should_update(widget[:version], widget_component[:version])
          
          if not confirm "Need to update: #{widget_component[:name]} to #{widget_component[:version]}. OK? [Yna] ",true,false,'y'
            puts "Skipping ... #{widget_component[:name]},#{widget_component[:version]}" if OPTIONS[:verbose]
          else 
            puts "Will update => #{widget_component[:name]}, #{widget_component[:version]}" if OPTIONS[:verbose]
            updates << widget_component
          end
        else
          puts "Widget '#{widget[:name]}' is already up-to-date (#{widget_component[:version]})"
        end
      end

      config[:plugins].each do |plugin|
        current_plugin = Installer.get_component_from_config(:plugin,plugin[:name])
        
        if current_plugin and Installer.should_update(plugin[:version], current_plugin[:version])
          
          if not confirm "Need to update: #{current_plugin[:name]} to #{current_plugin[:version]}. OK? [Yna] ",true,false,'y'
            puts "Skipping ... #{current_plugin[:name]},#{current_plugin[:version]}" if OPTIONS[:verbose]
          else 
            puts "Will update => #{current_plugin[:name]}, #{current_plugin[:version]}" if OPTIONS[:verbose]
            updates << current_plugin
          end
        else
          puts "Plugin '#{plugin[:name]}' is already up-to-date (#{current_plugin[:version]})" unless OPTIONS[:quiet]
        end
      end

      websdk_component = Installer.get_component_from_config(:websdk,'websdk')
      
      if websdk_component
        if Installer.should_update(config[:websdk], websdk_component[:version])
          new_websdk = websdk_component
          if not confirm "Need to update: 'websdk' to #{new_websdk[:version]}. OK? [Yna] ",true,false,'y'
            puts "Skipping ... websdk,#{new_websdk[:version]}" if OPTIONS[:verbose]
          else
            puts "Will update => websdk, #{new_websdk[:version]}" if OPTIONS[:verbose]
            updates << websdk_component
          end
        else
          if OPTIONS[:force_update]
            if confirm "Re-install local update: websdk to #{config[:websdk]}. OK? [Yna] ",true,false,'y'
              updates << websdk_component
            end
          else
            puts "Web SDK is already up-to-date (#{config[:websdk]})"
          end
        end
      end
      
      service_name = config[:service]
      service_component = Installer.get_component_from_config(:service,service_name)
      
      if service_component
        if Installer.should_update(config[:service_version], service_component[:version])
          if not confirm "Need to update: #{service_name} to #{service_component[:version]}. OK? [Yna] ",true,false,'y'
            puts "Skipping ... #{service_name},#{service_component[:version]}" if OPTIONS[:verbose]
          else
            puts "Will update => #{service_name}, #{service_component[:version]}" if OPTIONS[:verbose]
            updates << service_component
          end
        else
          if OPTIONS[:force_update]
            if confirm "Re-install local update: #{service_name} to #{config[:service_version]}. OK? [Yna] ",true,false,'y'
              puts "Will re-install => #{service_name}, #{config[:service_version]}" if OPTIONS[:verbose]
              updates << service_component
            end
          else
            puts "Service '#{service_name}' is already up-to-date (#{config[:service_version]})"
          end
        end
      end
      
      if not updates.empty?
        with_io_transaction(pwd) do |tx|

          Installer.with_project_config(pwd,true) do |config|
            config[:last_updated] = Time.now
            event = {:project_dir=>pwd,:config=>config,:tx=>tx}
            PluginManager.dispatchEvents('update_project',event) do
              opts = {:force=>true,:quiet=>true,:tx=>tx,:ignore_path_check=>true,:no_save=>true,:project_config=>config}
              updates.each do |component|
                case component[:type].to_sym
                
                  when :widget
                    opts[:version] = component[:version]
                    CommandRegistry.execute('add:widget',[component[:name],pwd],opts)
                  
                  when :plugin
                    opts[:version] = component[:version]
                    CommandRegistry.execute('add:plugin',[component[:name],pwd],opts)
                
                  when :websdk
                    Installer.create_project(pwd,File.basename(pwd),lang,config[:service_version],tx,true,component)
                    config[:websdk] = component[:version]
                  
                  when :service
                    Installer.require_component(:service, component[:name], component[:version], opts)
                    
                    config[:service_version] = component[:version]
                    service_dir = Installer.get_component_directory(component)
                    service_name = Project.make_service_name(component[:name])
                    script = File.join(service_dir,'install.rb')
                    puts "attempting to load service install.rb from #{script}" if OPTIONS[:debug]
                    project_config = Project.get_config(pwd) 
                    project_config.merge!(config)
                    require script
                    installer = Appcelerator.const_get(service_name).new
                    if installer.respond_to?(:update_project)
                      if installer.update_project(service_dir,pwd,project_config,tx,config[:service_version],component[:version])
                        puts "Updated service '#{component[:name]}' to #{component[:version]}"
                      end
                    else
                      puts "The #{service_name} service provides special updating functionality" if OPTIONS[:verbose]
                    end
                else
                  puts "Unknown component type: #{component[:type]}" if OPTIONS[:verbose]
                end
              end
            end
          end
        end
      else
        puts "Looks like everything is up-to-date. Cool!"
      end
    end
  end
end
