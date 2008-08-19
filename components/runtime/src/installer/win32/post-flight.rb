# This file is part of Appcelerator.
#
# Copyright (c) 2005-2008, Appcelerator, Inc.
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


