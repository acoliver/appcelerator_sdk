# Appcelerator SDK
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#
module Appcelerator
  class Installer
    
    def Installer.install_service_if_required(language,release_dir)
      puts "install service integration point for language = #{language} into #{release_dir}" if OPTIONS[:debug]

      config_file = File.join(release_dir,'config.yml')
      config = YAML::load_file(config_file) if File.exists?(config_file)
      config||={}

      # get the latest
      details = Installer.get_latest_service language
      
      if config['latest'] and not OPTIONS[:force_update]
        f = File.join(release_dir,config['latest'])
        if File.exists?(f) and File.exists?(File.join(f,'install.rb'))
          return f if details['version']==config['latest']
          puts "A new version #{details['version']} of the #{language} SOA integration point is available"
          if not confirm "Install it or use the current version (#{config['latest']})? (Y)es install new, (N)o keep current [Y]",true,false
            return f
          end
        end
      end

      service_dir = File.join(release_dir,details['version'])
      FileUtils.rm_r service_dir if File.exists?(service_dir)
      FileUtils.mkdir_p service_dir

      # now go fetch the version and install it
      Installer.http_fetch_into "#{language[0,1].upcase+language[1..-1]} #{details['version']}", details['url'], service_dir

      # attempt to load a pre_flight ruby script before doing loading the main installer
      pre_flight = File.join(service_dir,'pre_flight.rb')
      require pre_flight if File.exists?(pre_flight)
      
      # setup our config file
      config['latest'] = details['version']
      cf = File.open(config_file,'w+')
      cf.puts config.to_yaml
      cf.close
      
      # return our reference directory where the latest lives
      File.join(release_dir,details['version'])
    end
  
  end
end