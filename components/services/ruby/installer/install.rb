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
    def create_project(from_path,to_path,options,tx)
      puts "Creating new ruby project using #{from_path}" if OPTIONS[:debug]
      
      
      ## FIXME: need to ensure that json and other base libraries are installed
      
      rails_gem_array = Gem.cache.search('rails')
      if rails_gem_array.empty?
        die "Unable to create project. You must have Rails and all its dependencies installed first. Run 'gem install rails'."
      end
      
      rails_gem = rails_gem_array.last
      
      if OPTIONS[:debug]
        system("rails #{to_path} --skip #{OPTIONS[:railsargs]}")
      else
        system("rails #{to_path} --skip -q #{OPTIONS[:railsargs]}")
      end
      
      Appcelerator::Installer.copy tx, "#{from_path}/rails/.", "#{to_path}", nil, true

      projectname = File.basename(to_path)
      xml = File.read("#{from_path}/rails/public/appcelerator.xml")
      if rails_gem.version.to_s.to_f > 1.2
        xml.gsub!(/SESSIONID/,"_#{projectname}_session")
      else
        xml.gsub!(/SESSIONID/,"_#{projectname}_session_id")
      end
      
      tx.put "#{to_path}/public/appcelerator.xml", xml
      
      secret_auth_key = Digest::MD5.hexdigest(Time.new.to_s + self.inspect + IPSocket.getaddress(Socket::gethostname).to_s)       
      result = ERB.new(File.read("#{from_path}/rails/vendor/plugins/lib/appcelerator/service_broker_controller.rb")).result(binding)
      tx.put "#{to_path}/app/controllers/service_broker_controller.rb", result
      
      true
    end
  end
end


