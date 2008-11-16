#!/usr/bin/env ruby
#
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

require 'fileutils'

Signal.trap("INT") { puts; exit }

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

def add_to_path(dir)
  bash = "export PATH=$PATH:#{dir}"
  csh = "set PATH=$PATH:#{dir}"
  profiles = [['~/.bash_profile', bash],
              ['~/.profile',      bash],
              ['~/.tcshrc',       csh],
              ['~/.cshrc',        csh]]
  
  filename,addition = nil,nil
  profiles.each do |p,a|
    path = File.expand_path(p)
    if File.exists?(path)
      filename,addition = path,a
      break
    end
  end
  
  puts 'Adding app command to path:'
  if confirm("Append '#{addition.strip}' to '#{filename}'? [Yn] ", false)
    f = open(filename,'a')
    f << "\n" << addition << "\n"
    f.close 
    puts 'Added to path'
  else
    puts 'Skipped adding the \'app\' command to your path.'
  end
end

puts
puts '*' * 80
puts 'Appcelerator Open Web Platform Installer'.center(80)
puts '*' * 80
puts

#
# on osx, we install in the same place as osx 
# installer so we can be consistent
#
if RUBY_PLATFORM =~ /darwin/
  install_dir='/Library/Appcelerator'
else
  install_dir='/opt/appcelerator'
end

def permissions_fail!
  puts
  puts 'You don\'t have write access to that directory,'
  puts 'choose another location or re-run with root permissions'
  false
end

def valid_install_location?(dir)
  if File.exists?(dir)
    if File.stat(dir).writable?
      if confirm "Directory exists? Overwrite files? [Yn] ",false
        return true
      else
        return false
      end
    else
      return permissions_fail!
    end
  else
    while true
      parentdir = File.dirname(dir)
      if File.exists?(parentdir)
        if File.stat(parentdir).writable?
          return true
        else
          return permissions_fail!
        end
      else
        dir = parentdir # up the tree!
      end
    end
  end
end

from_dir = File.expand_path(File.dirname('.'))

# this environment variable is set by code in the makeself-header.sh script
cur_dir = ENV['LAUNCH_DIR']
if cur_dir
  FileUtils.cd(cur_dir)
else
  puts "Expected $LAUNCH_DIR to be set. Failing"
end

while true
  dir = ask "Install directory? [#{install_dir}] "
  dir = install_dir if not dir or dir == '' 
  install_dir = dir
  break if valid_install_location?(install_dir)
end

install_dir = File.expand_path install_dir



puts "Installing Appcelerator to #{install_dir}, One moment..."


# remove old symlinks from before 2.1
if Process.uid == 0
  FileUtils.safe_unlink '/usr/local/bin/appcelerator' rescue nil
  FileUtils.safe_unlink '/usr/bin/appcelerator' rescue nil
else
  if File.exists? '/usr/bin/appcelerator'
    puts 'The file /usr/bin/appcelerator is an out-of-date symlink that should be removed'
  end
  if File.exists? '/usr/local/bin/appcelerator'
    puts 'The file /usr/local/bin/appcelerator is an out-of-date symlink that should be removed'
  end
end

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
FileUtils.ln_s "#{install_dir}/appcelerator", "#{install_dir}/app", :force=>true

# make our symbolic link
bindir = '/usr/bin'

if Process.uid == 0
  if File.exists?(bindir)
    FileUtils.ln_s "#{install_dir}/appcelerator", "#{bindir}/app", :force=>true
    # set exec bits
    FileUtils.chmod 0755, "#{bindir}/app"
  end
  # set permissions
  FileUtils.chown_R 'root', nil, "#{install_dir}"
  FileUtils.chown_R 'root', nil, "#{bindir}/app"
else
  add_to_path(install_dir)
end

# make the directory cache where our files will go
FileUtils.mkdir_p "#{install_dir}/releases" unless File.exists? "#{install_dir}/releases"
FileUtils.mkdir_p "#{install_dir}/updates" unless File.exists? "#{install_dir}/updates"

# set execution bits
FileUtils.chmod 0755, "#{install_dir}/appcelerator"
FileUtils.chmod 0755, "#{install_dir}/app"


# these directories need to be writable by non-root
%w(releases updates lib commands).each do |name|
  FileUtils.chmod_R 0777, "#{install_dir}/#{name}"
end

puts "Completing installation...."
system "#{install_dir}/appcelerator --install 2>/dev/null"

if RUBY_PLATFORM =~ /darwin/
  Kernel.sleep 3
#  system "open http://127.0.0.1:9080"
  system "open http://appcelerator.org/gettingstarted"
end

puts "Installation successful! Enjoy."

exit 0
