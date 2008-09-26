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


require 'rubygems'
require 'md5'
require 'socket'
require 'erb'

include Appcelerator
module Appcelerator
  class Grails < Project

    def create_project(from_path,to_path,config,tx)

      puts "Creating new Grails project using #{from_path}" if OPTIONS[:debug]

      from_path = @service_dir
      
      cmd = "grails create-app \"#{@path}\""

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
      has_gcc = false
      if not RUBY_PLATFORM =~ /(windows|win32)/
        begin
          `gcc --version 2>&1`
          has_gcc = ($?.exitstatus != 127)
        rescue
        end
      end

      missing_gems = []
      
      if missing_gem? 'rails'
        missing_gems << 'rails'
      end
      if missing_gem? 'json' and has_gcc
        missing_gems << 'json'
      end
      if missing_gem? 'sqlite3-ruby' and has_gcc
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
          
          if RUBY_PLATFORM =~ /darwin/ and missing_gems.include? 'sqlite3-ruby' and not has_gcc
            puts 'Rails backend requires Apple Developer Tools ( http://developer.apple.com/technology/xcode.html )'
          end
          
          if missing_gem? 'json'
            puts 'Before running your Rails project, you must install json gem by doing \'gem install json\'.'
          end
          
          die 'Dependencies installed, please re-run your command'
        else
          die 'Not installing.'
        end
      end
      
      Gem.cache.search('rails').last
    end
    
    def update_project(from_path,to_path,config,tx,from_version,to_version)
      puts "Updating Rails project from #{from_version} to #{to_version}" if OPTIONS[:verbose]
      
      if to_version == '1.0.4'
        Installer.copy tx, "#{from_path}/rails/vendor/plugins/appcelerator/.", "#{to_path}/vendor/plugins/appcelerator/"

        projectname = File.basename(to_path)
        rails_gem = get_rails_gem
        xml = File.read("#{from_path}/rails/public/appcelerator.xml")
        if rails_gem.version.to_s.to_f > 1.2
          xml.gsub!(/SESSIONID/,"_#{projectname}_session")
        else
          xml.gsub!(/SESSIONID/,"_#{projectname}_session_id")
        end
        Installer.put "#{to_path}/public/appcelerator.xml", xml
      end
    end
  end
end


