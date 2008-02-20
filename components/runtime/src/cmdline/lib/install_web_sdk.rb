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
module Appcelerator
  class Installer
    
    def Installer.install_web_project(options)
      
      raise "Invalid options, must specify :web option" unless options[:web]
      raise "Invalid options, must specify :javascript option" unless options[:javascript]
      raise "Invalid options, must specify :images option" unless options[:images]
      raise "Invalid options, must specify :widgets option" unless options[:widgets]

      source_dir,name,web_version,checksum,already_installed = Appcelerator::Installer.install_component 'websdk','WebSDK','websdk'
      options[:websdk] = web_version
      options[:installed_widgets] = []

      Appcelerator::PluginManager.dispatchEvent 'before_copy_web',options,source_dir,web_version

      FileUtils.cp_r "#{source_dir}/js/.", options[:javascript]
      FileUtils.cp_r "#{source_dir}/images/.", options[:images]
      FileUtils.cp_r "#{source_dir}/swf/.", options[:web] + '/swf'
      FileUtils.cp_r Dir.glob("#{source_dir}/*.html"), options[:web]
      FileUtils.cp_r "#{source_dir}/common/.", options[:widgets] + '/common'

      widgets = Installer.find_dependencies_for({:name=>'websdk',:type=>'websdk'})
      
      # install our widgets
      widgets.each do |widget|
       Appcelerator::CommandRegistry.execute('add:widget',[widget[:name],options[:project]],{:version=>widget[:version],:quiet=>true})
       options[:installed_widgets] << {:name=>widget[:name],:version=>widget[:version]}
      end if widgets      

      Appcelerator::PluginManager.dispatchEvent 'after_copy_web',options,source_dir,web_version

      options
    end
  end
end