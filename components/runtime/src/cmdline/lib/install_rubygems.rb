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

