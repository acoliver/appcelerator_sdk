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

require 'yaml'

def die(msg=nil, exit_value=1)
  STDERR.puts " *ERROR: #{msg}" unless msg.nil?
  STDERR.flush
  exit exit_value
end

def ask_with_validation(q,msg,regexp,mask=false)
  response = nil
  while true
    response = ask(q,mask)
    break if response =~ regexp
    STDERR.puts msg if response
  end
  response
end

def ask(q,mask=false)
  if OPTIONS[:subprocess]
    STDOUT.puts "__MAGIC__|ask|#{q}|#{mask}|__MAGIC__"
  else
    STDOUT.print "#{q} "
  end
  STDOUT.flush
  mask = mask and STDIN.isatty and not OPTIONS[:subprocess]
  if mask
    system 'stty -echo' rescue nil
  end
  answer = ''
  while true
    ch = STDIN.getc
    break if ch==10
    answer << ch
  end
  if mask
    system 'stty echo' rescue nil
  end
  puts if mask # newline after password
  answer
end

def confirm(q,canforce=true,die_if_fails=true,default='y')
    return true if OPTIONS[:force]
    answer = ask(q)
    answer = default if not answer or answer == ''
    OPTIONS[:force]=true if canforce and ['A','a'].index(answer)
    if not ['y','Y','a','A'].index(answer)
      die('Cancelled!') if die_if_fails
      return false
    end
    true
end

def confirm_yes(q)
  confirm(q,true,false,'y')
end

#
# set up temp directory and delete it on exit
#
require 'tmpdir'
APP_TEMP_DIR=FileUtils.mkdir_p(File.join(Dir::tmpdir, "appcelerator.#{rand(10000)}.#{$$}"))

APP_TEMP_FILES = Array.new

def recursive_deltree(dir)
  APP_TEMP_FILES.each do |file|
    file.close rescue nil
  end
  Dir["#{dir}/**/**"].each do |f|
    FileUtils.rm_rf f
  end
  FileUtils.rm_rf dir
  FileUtils.rmdir dir rescue nil
end

at_exit { recursive_deltree APP_TEMP_DIR unless OPTIONS[:debug] }

if OPTIONS[:version] and ACTION
  if not OPTIONS[:version] =~ /[0-9]+\.[0-9]+(\.[0-9]+)?/
    die "Invalid version format. Must be in the format: X.X.X such as 2.0.1"
  end
end
 

module Appcelerator
  class Boot

    def Boot.boot

      config = Appcelerator::Installer.load_config
      
      username=nil
      password=nil
      
      if not OPTIONS[:server]
        OPTIONS[:server] = config[:server] || ENV['UPDATESITE'] || ET_PHONE_HOME
      end
      
      return nil if OPTIONS[:no_remote]
      
      if config[:username] and config[:password]

        # nothing required
        
      elsif ACTION != 'login'  

        puts 
        puts '*' * 80
        puts ' ' * 20 + 'Welcome to the Appcelerator Open Web Platform'
        puts '*' * 80
        puts
        
        yn = ask 'Do you have an account? (Y)es or (N)o [N]'

        if ['y','Y'].index(yn)
          Installer.login(username,password)
          puts "Welcome back ...."
          puts
                    
        else 
          username = password = 'anonymous'
          Installer.prompt_proxy(true)
          Installer.login(username, password)
        end

        Installer.save_config(username,password)

      end
      
    end
    
  end
end

