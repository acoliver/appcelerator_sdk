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
CommandRegistry.registerCommand(%w(install:updates install:update),'attempt to update installed components') do |args,options|
  
  puts "Checking for updates..." unless OPTIONS[:quiet]
  Installer.selfupdate
  
  list = Installer.fetch_distribution_list
  possible_updates = 0
  updated = []
  
  Installer.with_site_config(false) do |site_config|
    installed = site_config[:installed] || {}
    installed.keys.each do |key|
      entries = installed[key] || []
      entries.each do |entry|
        found = list[entry[:type].to_sym] || []
        found.each do |e|
          if e[:name] == entry[:name] and not updated.include? "#{entry[:type]}_#{entry[:name]}"
            
            local_version = entry[:version]
            remote_version = e[:version]
            
            if OPTIONS[:debug]
              puts "local_version=#{local_version},remote_version=#{remote_version}"
              puts "local_entry=#{entry.to_yaml}"
              puts "remote_entry=#{e.to_yaml}"
              puts
            end
            
            same_checksum = (e[:checksum].to_s == entry[:checksum].to_s)
            same_but_different = (local_version == remote_version and not same_checksum)
            
            update = Installer.should_update(local_version,remote_version) || same_but_different
            
            puts "should updated? #{update}" if OPTIONS[:debug]

            if update and not Installer.installed_this_session? entry
              
              possible_updates += 1
              if confirm_yes("Update #{entry[:type]} '#{entry[:name]}' from #{e[:version]} to #{entry[:version]} ? [Yna]")
                Installer.require_component(entry[:type],entry[:type],entry[:version])
                updated << "#{entry[:type]}_#{entry[:name]}"
              end
            end
          end
        end
      end
    end
  end

  if possible_updates == 0
    puts "No updates found. You're completely up-to-date." unless OPTIONS[:quiet]
  end

end
