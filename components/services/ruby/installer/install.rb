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
  class Ruby 
    def create_project(from_path,to_path,options)
      puts "Creating new ruby project using #{from_path}" if OPTIONS[:debug]

      rails_gem = Gem.cache.search('rails').last
      if not rails_gem
        puts "Unable to create project. You must have Rails and all its dependencies installed first. Run 'gem install rails'."
        return
      end
      
      if OPTIONS[:debug]
        system("rails #{to_path} --skip #{OPTIONS[:railsargs]}")
      else
        system("rails #{to_path} --skip -q #{OPTIONS[:railsargs]}")
      end
      
      FileUtils.cp_r "#{from_path}/rails/.", "#{to_path}"
      
      projectname = File.basename(to_path)
      puts "PROJECT #{projectname}"
      xml = File.read("#{to_path}/public/appcelerator.xml")
      if rails_gem.version.to_s.to_f > 1.2
        xml.gsub!(/SESSIONID/,"_#{projectname}_session")
      else
        xml.gsub!(/SESSIONID/,"_#{projectname}_session_id")
      end

      f = File.open("#{to_path}/public/appcelerator.xml",'w')
      f.puts xml
      f.flush
      f.close
      
      secret_auth_key = Digest::MD5.hexdigest(Time.new.to_s + self.inspect + IPSocket.getaddress(Socket::gethostname).to_s)       
      result = ERB.new(File.read("#{to_path}/app/controllers/service_broker_controller.rb")).result(binding)
      f = File.new("#{to_path}/app/controllers/service_broker_controller.rb",'w')
      f.puts result
      f.flush
      f.close
    end
  end
end


