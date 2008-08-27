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
  module Update
    class Patch
      def Patch.crc32(c)
          r = 0xFFFFFFFF
          c.each_byte do |b|
              r ^= b
              8.times do
                r = (r>>1) ^ (0xEDB88320 * (r & 1))
              end
          end
          r ^ 0xFFFFFFFF
      end
      
      def Patch.install
        from_dir = $Installer[:to_dir]


  		  STDOUT.puts 
  		  STDOUT.print "+ Performing self-update patch ... one moment "
  		  STDOUT.flush

        require 'digest/md5'

        
        # these are files that can't be patched
        excludes = %W(#{from_dir}/build.yml #{from_dir}/pre_flight.rb #{from_dir}/appcelerator)
        
        Dir["#{from_dir}/**/**"].each do |file|
          next if excludes.include? file
          next if File.directory? file
          target = file.gsub("#{from_dir}/",'')
          overwrite = File.exists? target
          puts "!!! #{target}, overwrite=#{overwrite}"
          if overwrite 
            if not File.writable? target
              person = is_win32 ? 'Administrator' : 'root'
              die "Can't write to file: #{target}. You must re-run this command as #{person}.  Sorry!"
            end
            old_checksum = crc32( File.read(file) )
			      new_checksum = crc32( File.read(target) )          
			      overwrite = old_checksum!=new_checksum
			    else
			      overwrite = true
			    end
			    if overwrite
			      src = file
			      dst = File.expand_path(SCRIPTDIR+'/'+target)
			      dstdir = File.dirname dst
	          FileUtils.mkdir_p(dstdir)
	          FileUtils.cp_r(src,dst)
	        end
        end
        
        STDOUT.puts 'Update patch complete...'
      end
    end
  end
end


Appcelerator::Update::Patch.install
