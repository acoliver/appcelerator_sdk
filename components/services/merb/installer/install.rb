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

module Appcelerator
  class Merb 
    def create_project(from_path,to_path,config,tx)
      puts "Creating new merb project using #{from_path}" if OPTIONS[:debug]
      
      
      missing_gems = []
      [["merb-core","0.9.9"],
       ["merb-gen","0.9.9"],
       ["merb-action-args", "0.9.9"]].each do |required_gem, required_version|
        if Gem.cache.search(required_gem,"=#{required_version}").empty?
          missing_gems << [required_gem,required_version]
		  end
      end

      unless missing_gems.empty?
        puts "Missing some required gems.  Run: "
        missing_gems.each do |required_gem,required_version|
          puts "   gem install #{required_gem} --version #{required_version}"
        end
        die "Unable to create project!"
      end


      win32 = (RUBY_PLATFORM=~/(:?mswin|mingw|win32)/)  #TODO: move this into core
      cmd =  win32 ? 'merb-gen.cmd' : 'merb-gen'
      cmdargs = ''
      
      if OPTIONS[:quiet] and not win32
        cmdargs = ' > /dev/null 2>&1'
      end
      
      projectname = File.basename(to_path)
      
      FileUtils.cd(File.dirname(to_path)) do
        puts "Running: #{cmd} app #{projectname} #{cmdargs} in directory: #{File.dirname(to_path)}" if OPTIONS[:verbose]
        system "#{cmd} app #{projectname} #{cmdargs}"
      end

      Installer.copy tx, "#{from_path}/merb/.", "#{to_path}", nil, true

      init = File.read "#{to_path}/config/init.rb"
      init.gsub!('# c[:session_id_key] = \'_session_id\'',"c[:session_id_key] = '_#{projectname}_session_id'")
      if not init =~ /appcelerator/
        init.gsub!('Merb::BootLoader.after_app_loads do',"dependencies 'appcelerator'\n\nMerb::BootLoader.after_app_loads do")
      end
      tx.put "#{to_path}/config/init.rb", init
      
      xml = File.read("#{from_path}/merb/public/appcelerator.xml")
      xml.gsub!(/SESSIONID/,"_#{projectname}_session_id")
      tx.put "#{to_path}/public/appcelerator.xml", xml
      
      boot = File.read("#{from_path}/merb/lib/appcelerator.rb")
      boot.gsub!('0.0.0',config[:service_version].to_s)
      tx.put "#{to_path}/lib/appcelerator.rb", boot
      
      true
    end
  end
end


