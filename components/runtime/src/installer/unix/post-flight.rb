#!/usr/bin/env ruby
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
require 'fileutils'

def ask(q)
  STDOUT.print "#{q} "
  STDOUT.flush
  answer = ''
  while true
    ch = STDIN.getc
    break if ch==10
    answer << ch
  end
  answer
end

def confirm(q,die_if_fails=true)
    answer = ask(q)
    if not ['','y','Y','a','A'].index(answer)
      die('Cancelled!') if die_if_fails
      return false
    end
    true
end

puts
puts '*' * 80
puts 'Appcelerator RIA Platform Installer'.center(80)
puts '*' * 80
puts

install_dir='/usr/local/appcelerator'

#
# on osx, we install in the same place as osx 
# installer so we can be consistent
#
if RUBY_PLATFORM =~ /darwin/
  install_dir='/Library/Appcelerator'
end

while true
  dir = ask "Install directory? [#{install_dir}] "
  dir = install_dir if not dir or dir == '' 
  install_dir = dir
  if File.exists?(dir)
    if confirm "Directory exists? Overwrite files? [Y] ",false
      break
    end
  else
    break
  end
end

install_dir = File.expand_path install_dir
from_dir = File.expand_path(File.dirname(__FILE__))

puts "Installing Appcelerator to #{install_dir}, One moment..."


# remove old symlinks from before 2.1
FileUtils.safe_unlink '/usr/local/bin/appcelerator' rescue nil
FileUtils.safe_unlink '/usr/bin/appcelerator' rescue nil

# check for earlier non-compatible < 2.1 gems
begin
  IO.popen 'gem list appcelerator' do |io|
    data = io.readlines.join('')
    m = /appcelerator \((.*)\)/.match(data)
    next unless m
    if m[1].index '2.0'
      STDERR.puts "WARNING: Detected older Appcelerator Ruby Gem. You will want to remove this gem."
      STDERR.puts "Found: #{m[0]}"
    end
  end
rescue
end

# do our installation
FileUtils.mkdir_p install_dir unless File.exists?(install_dir)
FileUtils.cp_r "#{from_dir}/.", install_dir

# make our symbolic link
bindir = '/usr/bin'

if File.exists?(bindir)
  FileUtils.ln_s "#{install_dir}/appcelerator", "#{install_dir}/app", :force=>true
  FileUtils.ln_s "#{install_dir}/appcelerator", "#{bindir}/app", :force=>true
end

# make the directory cache where our files will go
FileUtils.mkdir_p "#{install_dir}/releases" unless File.exists? "#{install_dir}/releases"
FileUtils.mkdir_p "#{install_dir}/updates" unless File.exists? "#{install_dir}/updates"

# set permissions
FileUtils.chown_R 'root', 'admin', "#{install_dir}"
FileUtils.chown_R 'root', 'admin', "#{bindir}/app"

# set execution bits
FileUtils.chmod 0755, "#{install_dir}/appcelerator"
FileUtils.chmod 0755, "#{install_dir}/app"
FileUtils.chmod 0755, "#{bindir}/app"

# these directories need to be writable by non-root
%w(releases updates lib commands).each do |name|
  FileUtils.chmod_R 0777, "#{install_dir}/#{name}"
end

puts "Completing installation...."
system "#{install_dir}/appcelerator --install 2>/dev/null"

if RUBY_PLATFORM =~ /darwin/
  Kernel.sleep 3
#  system "open http://127.0.0.1:9080"
  system "open http://www.appcelerator.org/gettingstarted"
end

puts "Installation successful! Enjoy."

exit 0
