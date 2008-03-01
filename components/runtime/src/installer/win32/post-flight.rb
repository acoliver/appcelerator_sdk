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

#
# create our appcelerator.rb file
#

RUBY_BIN=File.expand_path ARGV[0]
APPC_BIN=File.expand_path ARGV[1]

str=<<EOS
@ECHO OFF
@"#{RUBY_BIN}" "#{File.join(APPC_BIN,'appcelerator')}" %1 %2 %3 %4 %5 %6 %7 %8 %9
EOS


# 
# write out the batch file
#

f = File.open File.join(APPC_BIN,'app.bat'), 'w+'
f.puts str
f.flush
f.close


#
# mongrel service on win32 not placing binary in Ruby bin - we do it for him
#
require 'rubygems'
require 'fileutils'
svc = Gem.cache.search('mongrel_service').first
Gem.path.each do |path|
  dir = File.join(path,'gems',File.basename(svc.loaded_from.gsub('.gemspec','')))
  next unless File.exists? dir
  bin = File.join(dir,'bin','mongrel_service.exe')
  FileUtils.cp bin,File.dirname(RUBY_BIN)
  break
end


