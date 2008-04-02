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

      event = {:options=>options,:source_dir=>source_dir,:version=>web_version,:tx=>tx}
      PluginManager.dispatchEvents('copy_web',event) do
        
        Installer.copy(tx, "#{source_dir}/javascripts/.", options[:javascript])
        Installer.copy(tx, "#{source_dir}/swf/.", options[:web] + '/swf')
        Installer.copy(tx, "#{source_dir}/common/.", options[:widgets] + '/common')
        
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