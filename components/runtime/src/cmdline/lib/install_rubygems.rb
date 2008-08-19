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

