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
