#
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
require 'rbconfig'
require 'erb'

module Appcelerator
  class AppAdmin
    def AppAdmin.install_appadmin

      puts "Configuring admin server ... one moment"
      rubypath = File.expand_path(File.join(Config::CONFIG["bindir"], Config::CONFIG["ruby_install_name"]))
      name = 'appcelerator'
      port = 9080 
      workingdir = File.expand_path "#{File.dirname(__FILE__)}"

      %w(tmp log).each do |n|
        FileUtils.mkdir_p "#{workingdir}/#{n}"
      end
  
      case Config::CONFIG['target_os']
        when /darwin/
          name = 'com.appcelerator.admin.server'
          result = ERB.new(File.read("#{File.dirname(__FILE__)}/service.plist")).result(binding)
          output = File.new("#{workingdir}/appcelerator.plist", 'w+')
          output.write result
          output.close
          FileUtils.chmod 0755, "#{workingdir}/script/server"
          FileUtils.chmod 0444, "#{File.expand_path(output.path)}"
          system "launchctl stop #{name} 2>/dev/null"
          system "launchctl unload #{File.expand_path(output.path)} 2>/dev/null"
          system "launchctl load #{File.expand_path(output.path)}"
          Kernel::sleep 4

        when /linux/
          user = ENV['USER']
          result = ERB.new(File.read("#{File.dirname(__FILE__)}/service.init.d")).result(binding)
          require 'tempfile'
          tf = Tempfile.new 'app'
          initd = File.new(tf.path, 'w+')
          initd.write result
          initd.close
          FileUtils.chmod 0755, initd.path
          FileUtils.cp_r initd.path, '/etc/init.d'
          tf.delete
          system "/etc/init.d/appcelerator start"

        when /(windows|win32)/
          result = ERB.new(File.read("#{File.dirname(__FILE__)}/service.bat")).result(binding)
          batfile = File.expand_path(File.join(workingdir,"#{name}.bat"))
          bat = File.new(batfile, 'w+')
          bat.write result
          bat.close
          FileUtils.cp "#{SCRIPTDIR}/sqlite3.dll", Config::CONFIG["bindir"]
          FileUtils.cp "#{SCRIPTDIR}/sqlite3.exe", Config::CONFIG["bindir"]
          AppAdmin.execute "net stop #{name} 2>NUL"
          AppAdmin.execute "mongrel_rails service::remove -N #{name} 2>NUL"
          AppAdmin.execute batfile
          AppAdmin.execute "sc config #{name} start= auto DisplayName= \"Appcelerator Appcenter\""
          AppAdmin.execute "sc description #{name} \"Appcelerator Appcenter is the admin project server for your local Appcelerator installation.\""
          AppAdmin.execute "net start #{name}"
      end
    end
    
    private 
    
    def AppAdmin.execute(cmd)
      system cmd
    end
  end
end

Appcelerator::AppAdmin.install_appadmin