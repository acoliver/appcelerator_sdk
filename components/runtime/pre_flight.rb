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
            STDOUT.print "+ Performing self-update patch ... one moment \n"
            STDOUT.flush

        require 'digest/md5'

        
        # these are files that can't be patched
        excludes = %W(#{from_dir}/build.yml #{from_dir}/pre_flight.rb)
        

        is_win32 = !(RUBY_PLATFORM =~ /(windows|win32)/).nil?
        files_to_copy = []

        Dir["#{from_dir}/**/**"].each do |file|
          next if excludes.include? file
          next if File.directory? file
          target = file.gsub("#{from_dir}/",'')
          target = File.join(SYSTEMDIR, target)
          overwrite = File.exists? target

          if overwrite 
            old_checksum = crc32( File.read(file) )
            new_checksum = crc32( File.read(target) )
            overwrite = old_checksum!=new_checksum
          end

          puts "!!! #{target}, overwrite=#{overwrite}"

          if overwrite
            if not File.writable? target
              person = is_win32 ? 'Administrator' : 'root'
              die "Can't write to file: #{target}. You must re-run this command as #{person}.  Sorry!"
            end

          end

          # attempt to create the directory now
          # to trigger any exceptions before file copies
          FileUtils.mkdir_p(File.dirname(target))
          files_to_copy << [file, target]
        end

        # do the actual copy in another step
        # once we know we can write all these
        # files without persmissions issues
        files_to_copy.each do |pair|
            source = pair[0]
            target = pair[1]
            FileUtils.cp_r(source, target)
        end

        STDOUT.puts 'Update patch complete...'
      end
    end
  end
end


Appcelerator::Update::Patch.install
