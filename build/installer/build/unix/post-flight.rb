#!/usr/bin/ruby
#
# Appcelerator SDK
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
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

# do our installation
FileUtils.mkdir_p install_dir unless File.exists?(install_dir)
FileUtils.cp_r "#{from_dir}/.", install_dir

# make our symbolic link
bindir = '/usr/bin'

if File.exists?(bindir)
  FileUtils.ln_s "#{install_dir}/appcelerator", "#{bindir}/appcelerator", :force=>true
end

# set permissions
FileUtils.chown_R 'root', 'admin', "#{install_dir}"
FileUtils.chown_R 'root', 'admin', "#{bindir}/appcelerator"

# set execution bit
FileUtils.chmod 0755, "#{install_dir}/appcelerator"
FileUtils.chmod 0755, "#{bindir}/appcelerator"

puts "Installation successful! Enjoy."

exit 0