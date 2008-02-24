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

Appcelerator::CommandRegistry.registerCommand('project:update','update project components',[
  {
    :name=>'path',
    :help=>'path of the project',
    :required=>false,
    :default=>nil,
    :type=>[
      Appcelerator::Types::FileType,
      Appcelerator::Types::DirectoryType,
      Appcelerator::Types::AlphanumericType
    ],
    :conversion=>Appcelerator::Types::DirectoryType
  }
],nil,[
  'update',
  'update ~/myproject'
]) do |args,options|
  
  pwd = args[:path] || Dir.pwd

  FileUtils.cd(pwd) do 

    # this is used to make sure we're in a project directory
    lang = Appcelerator::Project.get_service(pwd)

    # determine if we have the service the user is asking for
    list = Appcelerator::Installer.fetch_distribution_list

    puts "One moment, determining latest versions ..." if OPTIONS[:verbose]

    updates = []

    Appcelerator::Installer.with_project_config(pwd,false) do |config|

      config[:widgets].each do |widget|
        widget_component = Appcelerator::Installer.get_component_from_config(:widget,widget[:name])
        update = false
        if widget_component
          widget_version = Appcelerator::Project.to_version(widget[:version])
          version = Appcelerator::Project.to_version(widget_component[:version])
          if version > widget_version
            update = true
          elsif version == widget_version and OPTIONS[:force_update]
            update = true
          else
            puts "Widget '#{widget[:name]}' is already up-to-date (#{widget_component[:version]})"
          end
        end
        if update
          if not confirm "Need to update: #{widget_component[:name]} to #{widget_component[:version]}. OK? [Yna] ",true,false,'y'
            puts "Skipping ... #{widget_component[:name]},#{widget_component[:version]}" if OPTIONS[:verbose]
          else 
            puts "Will update => #{widget_component[:name]}, #{widget_component[:version]}" if OPTIONS[:verbose]
            updates << widget_component
          end
        end
      end

      config[:plugins].each do |plugin|
        plugin_component = Appcelerator::Installer.get_component_from_config(:plugin,plugin[:name])
        update = false
        if plugin_component
          plugin_version = Appcelerator::Project.to_version(plugin[:version])
          version = Appcelerator::Project.to_version(plugin_component[:version])
          if version > plugin_version
            update = true
          elsif version == plugin_version and OPTIONS[:force_update]
            update = true
          else
            puts "Plugin '#{plugin[:name]}' is already up-to-date (#{plugin_component[:version]})"
          end
        end
        if update
          if not confirm "Need to update: #{plugin_component[:name]} to #{plugin_component[:version]}. OK? [Yna] ",true,false,'y'
            puts "Skipping ... #{plugin_component[:name]},#{plugin_component[:version]}" if OPTIONS[:verbose]
          else 
            puts "Will update => #{plugin_component[:name]}, #{plugin_component[:version]}" if OPTIONS[:verbose]
            updates << plugin_component
          end
        end
      end

      websdk_version = Appcelerator::Project.to_version(config[:websdk])
      websdk_component = Appcelerator::Installer.get_component_from_config(:websdk,'websdk')
      
      if websdk_component
        new_websdk = nil
        list[:websdk].each do |e|
          version = Appcelerator::Project.to_version(e[:version])
          if version > websdk_version
            new_websdk = e
            break
          elsif version == websdk_version and OPTIONS[:force_update]
            new_websdk = e
            break
          end
        end
        
        if new_websdk
          if not confirm "Need to update: 'websdk' to #{new_websdk[:version]}. OK? [Yna] ",true,false,'y'
            puts "Skipping ... websdk,#{new_websdk[:version]}" if OPTIONS[:verbose]
          else
            puts "Will update => websdk, #{new_websdk[:version]}" if OPTIONS[:verbose]
            updates << new_websdk
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
      
      service = config[:service]
      service_version = Appcelerator::Project.to_version(config[:service_version])
      service_component = Appcelerator::Installer.get_component_from_config(:service,service)
      
      if service_component
        new_service = nil
        list[:service].each do |e|
          if e[:type] == 'service' and e[:name] == service
            version = Appcelerator::Project.to_version(e[:version])
            if version > service_version
              new_service = e
              break
            elsif version == service_version and OPTIONS[:force_update]
              new_service = e
              break
            end 
          end
        end
        if new_service
            if not confirm "Need to update: #{new_service[:name]} to #{new_service[:version]}. OK? [Yna] ",true,false,'y'
              puts "Skipping ... #{new_service[:name]},#{new_service[:version]}" if OPTIONS[:verbose]
            else
              puts "Will update => #{new_service[:name]}, #{new_service[:version]}" if OPTIONS[:verbose]
              updates << new_service
            end
        else
          if OPTIONS[:force_update]
            if confirm "Re-install local update: #{service} to #{config[:service_version]}. OK? [Yna] ",true,false,'y'
              puts "Will re-install => #{service}, #{config[:service_version]}" if OPTIONS[:verbose]
              updates << service_component
            end
          else
            puts "Service '#{service}' is already up-to-date (#{config[:service_version]})"
          end
        end
      end
      
      if not updates.empty?
        with_io_transaction(pwd) do |tx|

          Appcelerator::Installer.with_project_config(pwd,true) do |config|
            config[:last_updated] = Time.now
            Appcelerator::PluginManager.dispatchEvent 'before_update_project',pwd,config,tx
            opts = {:force=>true,:quiet=>true,:tx=>tx,:ignore_path_check=>true,:no_save=>true,:project_config=>config}
            updates.each do |component|
              case component[:type]
                when :widget,'widget'
                  opts[:version] = component[:version]
                  Appcelerator::CommandRegistry.execute('add:widget',[component[:name],pwd],opts)
                  
                when :plugin,'plugin'
                  opts[:version] = component[:version]
                  Appcelerator::CommandRegistry.execute('add:plugin',[component[:name],pwd],opts)
                
                when :websdk,'websdk'
                  project_config,props=Appcelerator::Installer.create_project(pwd,File.basename(pwd),lang,config[:service_version],tx,true)
                  config[:websdk]=project_config[:websdk]
                
                when :service,'service'
                  config[:service_version]=component[:version]
                  service_dir = Appcelerator::Installer.get_component_directory(component)
                  service_name = Appcelerator::Project.make_service_name(component[:name])
                  script = File.join(service_dir,'install.rb')
                  puts "attempting to load service install.rb from #{script}" if OPTIONS[:debug]
                  project_config = Appcelerator::Project.get_config(pwd) 
                  project_config.merge!(config)
                  require script
                  installer = eval "Appcelerator::#{service_name}.new"
                  if installer.respond_to?(:update_project)
                    if installer.update_project(service_dir,pwd,project_config,tx,config[:service_version],component[:version])
                      puts "Updated service '#{component[:name]}' to #{component[:version]}"
                    end
                  else
                    if installer.create_project(service_dir,pwd,project_config,tx)
                      puts "Updated service '#{component[:name]}' to #{component[:version]}"
                    end
                  end
              else
              end
            end
            Appcelerator::PluginManager.dispatchEvent 'after_update_project',pwd,config,tx
          end
        end
      else
        puts "Looks like everything is up-to-date. Cool!"
      end
    end
    
  end
  
end