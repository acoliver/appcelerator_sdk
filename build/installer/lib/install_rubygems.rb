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
module Appcelerator
  class Installer

    def Installer.install_ruby_gems_if_needed
      
      begin
        require 'rubygems'
      rescue => e
        
        # not installed - we need to attempt to install it before continuing
        confirm("Appcelerator requires Rubygems to be installed before continuing. Install now? (Y)es, (N)o [Y]")

        # make sure we're root
        #require_admin_user

        # fetch rubygems and extract it (built into http_fetch)
        dir = Appcelerator::Installer.http_fetch 'RubyGems', 'http://rubyforge.org/frs/download.php/29548/rubygems-1.0.1.tgz'

        # map into the setup file
        gemdir = File.join(dir,'rubygems-1.0.1')
        setup_file = File.join(gemdir,'setup.rb')

        log_file = File.join(dir,'gem_install.log')

        cwd = Dir.pwd
        Dir.chdir gemdir

        # run the gem installer
        begin
          puts "Installing RubyGems 1.0.1" unless OPTIONS[:quiet]
          system "ruby #{setup_file} &>#{log_file}"
          
          # reload it
          require 'rubygems'
        ensure
          Dir.chdir cwd
        end
      end
    end
  end
end

