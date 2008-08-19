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


