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
module Appcelerator
  class Installer

    def Installer.install_web_project(options,tx,update=false,sdk=nil)
      
      raise "Invalid options, must specify :web option" unless options[:web]
      raise "Invalid options, must specify :javascript option" unless options[:javascript]
      raise "Invalid options, must specify :images option" unless options[:images]
      raise "Invalid options, must specify :widgets option" unless options[:widgets]

      if sdk.nil?
        sdk = Installer.require_component(:websdk, 'websdk', nil,
                                          :tx=>tx, :force=>update,
                                          :quiet_if_installed=>true)
      end
      source_dir = Installer.get_component_directory(sdk)
      web_version = sdk[:version]
      
      options[:websdk] = web_version
      options[:installed_widgets] = []

      puts "Using websdk #{web_version}" unless OPTIONS[:quiet]

      event = {:options=>options,:source_dir=>source_dir,:version=>web_version,:tx=>tx}
      PluginManager.dispatchEvents('copy_web',event) do
        
        Installer.copy(tx, "#{source_dir}/javascripts/.", options[:javascript])
        Installer.copy(tx, "#{source_dir}/swf/.", options[:web] + '/swf')
        Installer.copy(tx, "#{source_dir}/common/.", options[:widgets] + '/common')

        add_thing_options = {
          :quiet=>true,
          :quiet_if_installed=>true,
          :tx=>tx,
          :ignore_path_check=>true,
          :no_save=>false,
          :verbose=>false,
          :force_overwrite=>true
        }

        puts "Installing components ..." unless OPTIONS[:quiet]
        
        cur_quiet = OPTIONS[:quiet]
        OPTIONS[:quiet] = true
        
        
        # include any bundled components automagically
        Dir["#{source_dir}/_install/*.zip"].each do |filename|
          type = File.basename(filename).split('_')
          next unless type.length > 0
          type = type.first
          CommandRegistry.execute("install:#{type}",[filename],add_thing_options)
          CommandRegistry.execute("add:#{type}",[filename,options[:project]],add_thing_options)
        end
        
        OPTIONS[:quiet] = cur_quiet
        
        if not update
          Installer.copy(tx, "#{source_dir}/images/.", options[:images])
          Installer.copy(tx, Dir.glob("#{source_dir}/*.html"), options[:web])
          
          widgets = Installer.find_dependencies_for(sdk) || []
          # install our widgets
          widgets.each do |widget|
            add_widget_options = {
              :version=>widget[:version],
              :quiet=>true,
              :quiet_if_installed=>true,
              :tx=>tx,
              :ignore_path_check=>true,
              :no_save=>true
            }
            CommandRegistry.execute('add:widget',[widget[:name],options[:project]],add_widget_options)
            options[:installed_widgets] << {:name=>widget[:name],:version=>widget[:version]}
          end
        end
      end
      
      options
    end
  end
end