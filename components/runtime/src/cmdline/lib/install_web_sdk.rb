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
module Appcelerator
  class Installer

    def Installer.install_web_project(project,tx,update=false,sdk=nil)

      if sdk.nil?
        sdk = Installer.require_component(:websdk, 'websdk', nil,
                                          :tx=>tx, :force=>update,
                                          :quiet_if_installed=>true)
      end
      source_dir = Installer.get_component_directory(sdk)
      web_version = sdk[:version]

      project.config[:websdk] = web_version
      project.config[:widgets] = []

      puts "Using websdk #{web_version}" unless OPTIONS[:quiet]

      event = {:project=>project,:source_dir=>source_dir,:version=>web_version,:tx=>tx}
      PluginManager.dispatchEvents('copy_web',event) do
        
        Installer.copy(tx, "#{source_dir}/javascripts/.", project.get_web_path("javascripts"))
        Installer.copy(tx, "#{source_dir}/swf/.", project.get_web_path("swf"))
        Installer.copy(tx, "#{source_dir}/common/.", project.get_web_path("widgets/common"))

        add_thing_options = {
          :quiet=>true,
          :quiet_if_installed=>true,
          :tx=>tx,
          :ignore_path_check=>true,
          :no_save=>false,
          :verbose=>false,
          :force_overwrite=>true,
          :project=>project
        }

        puts "Installing components ... (this may take a few seconds)" unless OPTIONS[:quiet]
        
        cur_quiet = OPTIONS[:quiet]
        OPTIONS[:quiet] = true
        
        count = 0
        
        # include any bundled components automagically
        Dir["#{source_dir}/_install/*.zip"].each do |filename|
          type = File.basename(filename).split('_')
          next unless type.length > 0
          type = type.first
          CommandRegistry.execute("install:#{type}",[filename],add_thing_options)
          CommandRegistry.execute("add:#{type}",[filename,project.path],add_thing_options)
          count+=1
        end

        puts "#{count} components installed ... " unless OPTIONS[:quiet]
        
        OPTIONS[:quiet] = cur_quiet
        
        if not update
          Installer.copy(tx, "#{source_dir}/images/.", project.get_web_path("images"))
          Installer.copy(tx, Dir.glob("#{source_dir}/*.html"), project.get_path(:web))
          
          widgets = Installer.find_dependencies_for(sdk) || []
          # install our widgets
          widgets.each do |widget|
            add_widget_options = {
              :version=>widget[:version],
              :quiet=>true,
              :quiet_if_installed=>true,
              :tx=>tx,
              :ignore_path_check=>true,
              :no_save=>true,
              :project=>project
            }
            CommandRegistry.execute('add:widget',[widget[:name],project.path],add_widget_options)
          end
        end
      end

    end
  end
end
