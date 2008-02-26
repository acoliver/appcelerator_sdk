#
# Appcelerator SDK
#
# Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
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
require 'yaml'

#
# start our update check thread which will ping the
# dev network for updates
#
Thread.new do 
  while true
    config = Hash.new
    begin
      config_file = "#{RAILS_ROOT}/tmp/appcelerator.yml"
      config = YAML::load_file config_file if File.exists?(config_file)
      config||=Hash.new
      interval = 1.day.to_i
      if config 
         i = config[:interval]
         if i
           if i.class == Fixnum
             interval = i
           else
             interval = eval(i) rescue interval
           end
         end
      end
      if interval < 1.minute
        interval = 1.minute
      end
      t = config[:last] || nil 
      if not t or Time.now - t >= interval
        if not config[:no_monitor] 
          begin
            debug = config[:debug] 
            flags = debug ? '--debug' : '--quiet'
            IO.popen "appcelerator network:list #{flags}" do |io|
              io.readlines
            end
          rescue
            # this is OK
          end
        end
        config[:last] = Time.now
        cf = File.new config_file,'w+'
        cf.puts config.to_yaml
        cf.close
      end
    rescue => e
      # oops, this is OK - don't fail
    ensure
      Kernel::sleep interval
    end
  end
end