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
            local_checksum = entry[:checksum]
            remote_checksum = e[:checksum]
            
            if OPTIONS[:debug]
              puts "local_version=#{local_version},remote_version=#{remote_version}"
              puts "local_checksum=#{local_checksum},remote_checksum=#{remote_checksum}"
              puts "local_entry=#{entry.to_yaml}"
              puts "remote_entry=#{e.to_yaml}"
              puts
            end
            
            same_checksum = (e[:checksum].to_s == entry[:checksum].to_s)
            same_but_different = (local_version == remote_version and not same_checksum)
            
            update = Installer.should_update(local_version,remote_version,local_checksum,remote_checksum) || same_but_different
            
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
