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
