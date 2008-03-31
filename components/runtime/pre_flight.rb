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

module Appcelerator
  module Update
    class Patch
      def Patch.install
        from_dir = $Installer[:to_dir]

  		  STDOUT.puts 
  		  STDOUT.print "+ Performing self-update patch ... one moment "
  		  STDOUT.flush

        require 'digest/md5'
        def crc32(c)
            r = 0xFFFFFFFF
            c.each_byte do |b|
                r ^= b
                8.times do
                  r = (r>>1) ^ (0xEDB88320 * (r & 1))
                end
            end
            r ^ 0xFFFFFFFF
        end
        
        # these are files that can't be patched
        excludes = %W(#{from_dir}/build.yml #{from_dir}/pre_flight.rb #{from_dir}/appcelerator)
        
        Dir["#{from_dir}/**/**"].each do |file|
          next if excludes.include? file
          next if File.directory? file
          target = file.gsub("#{from_dir}/",'')
          overwrite = File.exists? target
          if overwrite 
            old_checksum = crc32 File.read(file)
			      new_checksum = crc32 File.read(target)           
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
        
        STDOUT.puts "Update patch complete..."
      end
    end
  end
end


Appcelerator::Update::Patch.install
