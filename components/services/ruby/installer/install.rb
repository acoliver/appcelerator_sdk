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

require 'rubygems'
require 'md5'
require 'socket'
require 'erb'

include Appcelerator
module Appcelerator
  class Ruby 
    def create_project(from_path,to_path,config,tx)

      puts "Creating new ruby project using #{from_path}" if OPTIONS[:debug]
      
      rails_gem = get_rails_gem
      
      if not OPTIONS[:migrate]
        cmd = (RUBY_PLATFORM=~/(windows|win32)/).nil? ? 'rails' : 'rails.cmd'
        if OPTIONS[:debug]
          system "#{cmd} \"#{to_path}\" --skip"
        else
          system("#{cmd} \"#{to_path}\" --skip -q #{OPTIONS[:args]}")
        end
      end

      env = File.read File.expand_path("#{to_path}/config/environment.rb")
      if not env =~ /require 'appcelerator'/
        env << "\nrequire 'appcelerator'\n"
        tx.put "#{to_path}/config/environment.rb", env
      end
      
      Installer.copy tx, "#{from_path}/rails/.", "#{to_path}", nil, true

      projectname = File.basename(to_path)
      xml = File.read("#{from_path}/rails/public/appcelerator.xml")
      if rails_gem.version.to_s.to_f > 1.2
        xml.gsub!(/SESSIONID/,"_#{projectname}_session")
      else
        xml.gsub!(/SESSIONID/,"_#{projectname}_session_id")
      end
      
      tx.put "#{to_path}/public/appcelerator.xml", xml
      
      secret_auth_key = Digest::MD5.hexdigest(Time.new.to_s + self.inspect + IPSocket.getaddress(Socket::gethostname).to_s)       
      result = ERB.new(File.read("#{from_path}/rails/app/controllers/service_broker_controller.rb")).result(binding)
      tx.put "#{to_path}/app/controllers/service_broker_controller.rb", result
      
      boot = File.read("#{from_path}/rails/vendor/plugins/appcelerator/lib/appcelerator.rb")
      boot.gsub!('0.0.0',config[:service_version])
      tx.put "#{to_path}/vendor/plugins/appcelerator/lib/appcelerator.rb", boot
      
      Dir["#{from_path}/plugins/*.rb"].each do |fpath|
        fname = File.basename(fpath)
        Installer.copy tx, fpath, "#{to_path}/plugins/#{fname}"
      end
      
      true
    end
    
    def check_dependencies(component)
      get_rails_gem
    end
    
    def missing_gem? gemname
      Gem.cache.search(gemname).empty?
    end
    
    def get_rails_gem
      missing_gems = []
      
      if missing_gem? 'rails'
        missing_gems << 'rails'
      end
      if missing_gem? 'json' and missing_gem? 'json_pure'
        if RUBY_PLATFORM =~ /(windows|win32)/
          missing_gems << 'json_pure'
        else
          missing_gems << 'json'
        end
      end
      if missing_gem? 'sqlite3-ruby'
        missing_gems << 'sqlite3-ruby'
      end
      
      if not missing_gems.empty?
        STDERR.puts 'Rails, json, and sqlite3 must be installed to create a project.'
        if not OPTIONS[:quiet] and confirm 'Install dependencies now? [Yn]',true,false,'y'
          
          if RUBY_PLATFORM=~/(windows|win32)/
            exec = 'gem.bat'
          else
            exec = 'sudo gem'
          end
          
          missing_gems.each do |gem|
            cmd = "#{exec} install #{gem} -y"
            puts cmd
            if not system(cmd)
              die "Unable to install required ruby gems"
            end
          end
          
          die 'Dependencies installed, please re-run your command'
        else
          die 'Not installing.'
        end
      end
      
      Gem.cache.search('rails').last
    end
  end
end


