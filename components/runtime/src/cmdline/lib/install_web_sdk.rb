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
    def Installer.install_web_sdk
      
  		# get the latest SDK
  		sdk_pkg,packages,bundles = Installer.get_latest_sdk
		  config_file = File.join(RELEASE_DIR,'web','config.yml')
		  config_file_found =  File.exists?(config_file)
		  config = YAML.load_file(config_file) if config_file_found
		  config||={}
		  
		  install = config_file_found==false
		  target_dir = nil
		  version = nil
		  widgets = config[:widgets] || []
		  
  		if sdk_pkg
  			url = sdk_pkg['url']
  			version = sdk_pkg['version']
  			checksum = sdk_pkg['checksum']||''
  			target_dir = File.join(RELEASE_DIR,'web',version)
  			if not File.exists?(target_dir) or OPTIONS[:force_update] or config[:checksum]!=checksum
  			  install = true
  			end
  		else
  	    if not config_file_found or not config[:version]
  	      STDERR.puts "Can't install required Web SDK. Failed to connect to the Appcelerator Network."
  	      STDERR.puts "Are you connected to the Internet? Please check your connection and try again." 
  	      exit 1
  	    else
  	      # we're not connected but we have a local SDK
  	      dir = File.join(RELEASE_DIR,'web',config[:version])
  	      return dir,config[:version],widgets
		    end
  		end  
  		
  		if install
  		  widgets = do_install(target_dir,version,url,bundles)
		  end

			return target_dir,version,widgets
    end
    
    def Installer.do_install(target_dir,version,url,bundles)
		  FileUtils.mkdir_p target_dir unless File.exists?(target_dir)
      Appcelerator::PluginManager.dispatchEvent 'before_web_sdk_install',target_dir,version
		  Installer.http_fetch_into "SDK #{version}", url, target_dir
		  FileUtils.rm_r "#{RELEASE_DIR}/web/config.yml" if File.exists?("#{RELEASE_DIR}/web/config.yml")
		  # download and install the core modules
		  core_widgets = []
			bundles.each do |b|
			  if b['name'] == 'core'
			      items = b['items']
			      items.each do |item|
			        name = item['name']
			        version = item['version']
			        Appcelerator::Installer.install_component 'widget',name,item['url'],"#{RELEASE_DIR}/widgets",true
			        core_widgets << {:name=>name,:version=>version}
		        end
			    break
		    end
		  end
		  Installer.put "#{RELEASE_DIR}/web/config.yml", {:version=>version, :widgets=>core_widgets}.to_yaml.to_s
      Appcelerator::PluginManager.dispatchEvent 'after_web_sdk_install',target_dir,version
      puts "Installed SDK: #{version}" unless OPTIONS[:quiet]
      core_widgets
    end
    
    def Installer.install_web_project(options)
      raise "Invalid options, must specify :web option" unless options[:web]
      raise "Invalid options, must specify :javascript option" unless options[:javascript]
      raise "Invalid options, must specify :images option" unless options[:images]
      raise "Invalid options, must specify :widgets option" unless options[:widgets]

      # determine the source 
      source_dir,web_version,widgets = Installer.install_web_sdk
      
      Appcelerator::PluginManager.dispatchEvent 'before_copy_web',options,source_dir,web_version

      FileUtils.cp_r "#{source_dir}/js/.", options[:javascript]
      FileUtils.cp_r "#{source_dir}/images/.", options[:images]
      FileUtils.cp_r "#{source_dir}/swf/.", options[:web] + '/swf'
      FileUtils.cp_r Dir.glob("#{source_dir}/*.html"), options[:web]
      FileUtils.cp_r "#{source_dir}/common/.", options[:widgets] + '/common'
      
      # install our widgets
      widgets.each do |widget|
        Appcelerator::CommandRegistry.execute('add:widget',[widget[:name],options[:project]],{:version=>widget[:version],:quiet=>true})
      end

      Appcelerator::PluginManager.dispatchEvent 'after_copy_web',options,source_dir,web_version

      options
    end
  end
end