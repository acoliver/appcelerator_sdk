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
  		if sdk_pkg
  			url = sdk_pkg['url']
  			version = sdk_pkg['version']
  			target_dir = File.join(RELEASE_DIR,'web',version)
  			if not File.exists?(target_dir) or OPTIONS[:force_update]
  			  FileUtils.mkdir_p target_dir unless File.exists?(target_dir)
          Appcelerator::PluginManager.dispatchEvent 'before_web_sdk_install',target_dir,version
  			  Installer.http_fetch_into "SDK #{version}", url, target_dir
  			  FileUtils.rm_r "#{RELEASE_DIR}/web/config.yml" if File.exists?("#{RELEASE_DIR}/web/config.yml")
  			  Installer.put "#{RELEASE_DIR}/web/config.yml", {:version=>version}.to_yaml.to_s
  			  # download and install the core modules
    			bundles.each do |b|
    			  if b['name'] == 'core'
    			      core_url = b['url']
    			      widget_temp_dir = Installer.tempdir
    			      Installer.http_fetch_into "SDK core widgets",core_url,widget_temp_dir
    			      Dir["#{widget_temp_dir}/*.zip"].each do |z|
    			        dirname = "#{target_dir}/modules"
    			        Zip::ZipFile::open(z) do |zf|
                    bcf = zf.read 'build.yml'
                    bconfig = YAML::load bcf
                    name = bconfig[:name].gsub(':','_')
                    dirname = "#{dirname}/#{name}"
                    FileUtils.rm_r dirname if File.exists?(dirname)
                    puts "created new core module dir: #{dirname}" if OPTIONS[:debug]
                    zf.each do |e|
                      fpath = File.join(dirname, e.name)
                      FileUtils.mkdir_p(File.dirname(fpath))
                      puts "extracting ... #{fpath}" if OPTIONS[:debug]
                      FileUtils.rm_r(fpath) if File.exists?(fpath)
                      zf.extract(e, fpath) 
                    end
                    zf.close
                  end
  			        end
    			    break
  			    end
  			  end
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
      FileUtils.cp_r "#{source_dir}/modules/.", options[:widgets]
      FileUtils.cp_r Dir.glob("#{source_dir}/*.html"), options[:web]
      
      options[:web_version]=web_version

      Appcelerator::PluginManager.dispatchEvent 'after_copy_web',options,source_dir,web_version

      options
    end
  end
end