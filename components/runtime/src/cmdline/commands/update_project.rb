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
    
    puts "One moment, determining latest versions ..." if OPTIONS[:verbose]

    updates = []

    Installer.with_project_config(pwd,false) do |config|
      
      websdk_component = {
        :type => :websdk,
        :name => 'websdk',
        :version => config[:websdk]
      }
      service_component = {
        :type => :service,
        :name => config[:service],
        :version => config[:service_version]
      }
      
      project_websdk = Installer.get_component(:local, websdk_component) || websdk_component
      project_service = Installer.get_component(:local, service_component) || service_component
            
      ask_to_update(config[:widgets], updates, :widget)
      ask_to_update(config[:plugins], updates, :plugin)
      ask_to_update([project_websdk, project_service], updates)
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
                  
                  from_version = config[:service_version]
                  to_version = config[:service_version] = component[:version]
                  
                  service_dir = Installer.get_component_directory(component)
                  service_name = Project.make_service_name(component[:name])
                  script = File.join(service_dir,'install.rb')
                  puts "attempting to load service install.rb from #{script}" if OPTIONS[:debug]
                  project_config = Project.get_config(pwd) 
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
        end
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
  components.each do |project_cm|
    
    project_cm[:type] = type if type
    current = Installer.get_current_available_component(project_cm)
    if current and Installer.should_update(project_cm[:version], current[:version])
      
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
