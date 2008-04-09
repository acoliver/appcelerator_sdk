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

module Appcelerator
  class Merb 
    def create_project(from_path,to_path,config,tx)
      puts "Creating new merb project using #{from_path}" if OPTIONS[:debug]
      
      
      merb_gem_array = Gem.cache.search('merb-core')
      if merb_gem_array.empty?
        die "Unable to create project! Run 'gem install merb' first."
      end
      
      merb_gem_array = merb_gem_array.last

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


