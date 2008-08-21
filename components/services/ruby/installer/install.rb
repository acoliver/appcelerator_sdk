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

require 'rubygems'
require 'md5'
require 'socket'
require 'erb'

include Appcelerator
module Appcelerator
  class Ruby 
    def create_project(from_path,to_path,config,tx)

      puts "Creating new Rails project using #{from_path}" if OPTIONS[:debug]
      
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
      has_gcc = false
      if not RUBY_PLATFORM =~ /(windows|win32)/
        begin
          system('gcc &> /dev/null')
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


