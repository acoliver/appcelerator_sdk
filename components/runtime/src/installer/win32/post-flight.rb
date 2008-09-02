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

#TODO: this is used by appadmin and commented out for now
#require 'rubygems'
#require 'fileutils'
#svc = Gem.cache.search('mongrel_service').first
#Gem.path.each do |path|
#  dir = File.join(path,'gems',File.basename(svc.loaded_from.gsub('.gemspec','')))
#  next unless File.exists? dir
#  bin = File.join(dir,'bin','mongrel_service.exe')
#  FileUtils.cp bin,File.dirname(RUBY_BIN)
#  break
#end


