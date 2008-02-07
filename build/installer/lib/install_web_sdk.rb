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
  		sdk_pkg = Installer.get_latest_sdk
  		if sdk_pkg
  			url = sdk_pkg['url']
  			version = sdk_pkg['version']
  			target_dir = File.join(RELEASE_DIR,'web',version)
  			if not File.exists?(target_dir) or OPTIONS[:force_update]
  			  FileUtils.mkdir_p target_dir unless File.exists?(target_dir)
          Appcelerator::PluginManager.dispatchEvent 'before_web_sdk_install',target_dir,version
  			  Installer.http_fetch_into "SDK #{version}", url, target_dir
  			  Installer.put "#{RELEASE_DIR}/web/config.yml", {:version=>version}.to_yaml.to_s
          Appcelerator::PluginManager.dispatchEvent 'after_web_sdk_install',target_dir,version
  			end
  			return target_dir,version
  		else
  		  config_file = File.join(RELEASE_DIR,'web','config.yml')
  		  if File.exists?(config_file)
  		    config = YAML.load_file(config_file)
  		    return "#{RELEASE_DIR}/web/#{config[:version]}",config[:version]
  	    else
  	      STDERR.puts "Can't install required Web SDK. Failed to connect to the Appcelerator Network."
  	      STDERR.puts "Are you connected to the Internet? Please check your connection and try again." 
  	      exit 1
		    end
  		end  
  		nil
    end
    def Installer.install_web_project(options)
      raise "Invalid options, must specify :web option" unless options[:web]
      raise "Invalid options, must specify :javascript option" unless options[:javascript]
      raise "Invalid options, must specify :images option" unless options[:images]
      raise "Invalid options, must specify :widgets option" unless options[:widgets]

      # determine the source 
      source_dir,web_version = Installer.install_web_sdk
      
      Appcelerator::PluginManager.dispatchEvent 'before_copy_web',options,source_dir,web_version

      FileUtils.cp_r "#{source_dir}/js/.", options[:javascript]
      FileUtils.cp_r "#{source_dir}/images/.", options[:images]
      FileUtils.cp_r "#{source_dir}/swf/.", options[:web] + '/swf'
      FileUtils.cp_r Dir.glob("#{source_dir}/*.html"), options[:web]
      
      options[:web_version]=web_version

      Appcelerator::PluginManager.dispatchEvent 'after_copy_web',options,source_dir,web_version

      options
    end
  end
end