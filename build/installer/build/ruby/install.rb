# Appcelerator SDK
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#
require 'md5'
require 'socket'
require 'erb'

module Appcelerator
  class Ruby 
    def create_project(from_path,to_path,options)
      puts "Creating new ruby project using #{from_path}" if OPTIONS[:debug]

      #FIXME: make sure and check for RoR

      Appcelerator::Installer.install_appcelerator_gem_if_needed from_path

      #
      # run the system rails command
      #
      if OPTIONS[:verbose]
          system("rails --skip #{to_path}")
      else
          system("rails --skip #{to_path} &>appcelerator.log")
          FileUtils.rm_r 'appcelerator.log' rescue nil
      end
      
      secret_auth_key = Digest::MD5.hexdigest(Time.new.to_s + to_path + IPSocket.getaddress(Socket::gethostname).to_s)   

      FileUtils.mkdir "#{to_path}/app/services" unless File.exists?("#{to_path}/app/services")
      
      # options = Hash.new
      # options[:web]="#{to_path}/public"
      # options[:javascript]="#{to_path}/public/javascripts"
      # options[:images]="#{to_path}/public/images"
      # options[:widgets]="#{to_path}/public/widgets"
      # 
      # Installer.install_web_project(options)
      rails_gem = Gem.cache.search('rails').last
      
      template_dir = File.expand_path(File.join(from_path,'templates'))

      # replace the XML with the correct sessionid
      projectname = File.basename(to_path)
      xml = File.read("#{template_dir}/appcelerator.xml")
      if rails_gem.version.to_s.to_f > 1.2
        xml.gsub!(/SESSIONID/,"_#{projectname}_session")
      else
        xml.gsub!(/SESSIONID/,"_#{projectname}_session_id")
      end
            
      f=File.open("#{to_path}/public/appcelerator.xml",'w')
      f.puts xml
      f.flush
      f.close
      
      if rails_gem.version.to_s.to_f > 1.2
        FileUtils.cp_r "#{template_dir}/application.rb", "#{to_path}/app/controllers"
      end
      f = File.open("#{to_path}/config/environment.rb", 'a+')
      if not f.read =~ /require 'appcelerator'/
          f.write("\n\nrequire 'appcelerator'")
      end
      f.close
      
      %w( routes.rb ).each do |file|
          FileUtils.cp_r "#{template_dir}/#{file}", "#{to_path}/config"
      end
      
      %w( proxy_controller.rb
          service_broker_controller.rb
          upload_controller.rb
      ).each do |file|
          FileUtils.cp_r "#{template_dir}/#{file}", "#{to_path}/app/controllers"
      end
      
      %w(upload download).each do |dir|
          FileUtils.mkdir "#{to_path}/app/views/#{dir}" unless File.exists?("#{to_path}/app/views/#{dir}")
      end
      
      FileUtils.cp_r "#{template_dir}/upload_index.rhtml", "#{to_path}/app/views/upload/index.rhtml"
      FileUtils.cp_r "#{template_dir}/download_index.rhtml", "#{to_path}/app/views/download/index.rhtml"
      
      result = ERB.new(File.read("#{to_path}/app/controllers/service_broker_controller.rb")).result(binding)
      f = File.new("#{to_path}/app/controllers/service_broker_controller.rb",'w')
      f.puts result
      f.flush
      f.close
      
      FileUtils.cp_r "#{template_dir}/service_broker_helper.rb", "#{to_path}/app/helpers"
      FileUtils.cp_r "#{template_dir}/test_service.rb", "#{to_path}/app/services"

    end
  end
end


