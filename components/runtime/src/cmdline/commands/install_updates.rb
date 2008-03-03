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

Appcelerator::CommandRegistry.registerCommand(%w(install:updates install:update),'attempt to update installed components',nil,nil,nil) do |args,options|
  
  puts "Checking for updates..." unless OPTIONS[:quiet]

  list = Appcelerator::Installer.fetch_distribution_list
  count = 0
  updated = []
  
  Appcelerator::Installer.with_site_config(false) do |site_config|
    installed = site_config[:installed]
    if installed
      installed.keys.each do |key|
        entries = installed[key] 
        entries.each do |entry|
          found = list[entry[:type].to_sym]
          if found
            found.each do |e|
              if e[:name] == entry[:name] and not updated.include? "#{entry[:type]}_#{entry[:name]}"
                local_version = Appcelerator::Project.to_version(entry[:version])
                remote_version = Appcelerator::Project.to_version(e[:version])
                puts "local_version=#{local_version},remote_version=#{remote_version}" if OPTIONS[:debug]
                puts "local_entry=#{entry.to_yaml}" if OPTIONS[:debug]
                puts "remote_entry=#{e.to_yaml}" if OPTIONS[:debug]
                puts if OPTIONS[:debug]
                same_checksum = e[:checksum].to_s == entry[:checksum].to_s
                same_version = local_version == remote_version
                update = (same_version and same_checksum==false)
                update = update ? local_version <= remote_version : remote_version > local_version
                update = true if OPTIONS[:force_update]
                puts "should updated? #{update}" if OPTIONS[:debug]
                if update 
                  next if Appcelerator::Installer.installed_this_session?(entry[:type],entry[:name],entry[:version])
                end
                count+=1 if update
                if update and confirm "Update #{entry[:type]} '#{entry[:name]}' from #{e[:version]} to #{entry[:version]} ? [Yna]",true,false,'y'
                  Appcelerator::Installer.install_component entry[:type].to_sym,entry[:type].to_s,entry[:name],true,nil,true,false
                  updated << "#{entry[:type]}_#{entry[:name]}"
                end
              end
            end
          end
        end
      end
    end
  end
  
  #
  # this is a special case where we need to self-update the binary and related 
  # files itself
  #
  build_config = YAML::load_file File.expand_path("#{SCRIPTDIR}/build.yml")
  updates = list[:update]
  if updates
    update = Appcelerator::Installer.sort_components(updates)
    local_version = Appcelerator::Project.to_version(build_config[:version])
    remote_version = Appcelerator::Project.to_version(update[:version])
    if local_version < remote_version or OPTIONS[:force_update]
      if confirm "Self-update this program from #{build_config[:version]} to #{update[:version]} ? [Yna]",true,false,'y'
        Appcelerator::Installer.install_component update[:type].to_sym,update[:type].to_s,update[:name],true,nil,true,false
        updated << "#{update[:type]}_#{update[:name]}"
        build_config[:version] = update[:version]
        cf = File.open "#{SCRIPTDIR}/build.yml",'w+'
        cf.puts build_config.to_yaml
        cf.close
        count+=1
      end
    end
  end
  
  if count == 0
    puts "No updates found. You're completely up-to-date." unless OPTIONS[:quiet]
  end

end
