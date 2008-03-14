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
require 'yaml'

def die(msg=nil)
  STDERR.puts msg unless nil
  STDERR.flush
  exit 1
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
  STDOUT.print "#{q} "
  STDOUT.flush
  if mask and STDIN.isatty
    system 'stty -echo' rescue nil
  end
  answer = ''
  while true
    ch = STDIN.getc
    break if ch==10 or nil
    answer << ch
  end
  if mask and STDIN.isatty
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

#
# set up temp directory and delete it on exit
#
APP_TEMP_DIR=FileUtils.mkdir_p(File.join(ENV['TMPDIR'] || ENV['TEMP'] || ENV['TMP'] || '.',"appcelerator.#{rand(10000)}.#{$$}"))
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

if OPTIONS[:version]
  if not OPTIONS[:version] =~ /[0-9]\.[0-9](\.[0-9])?/
    die "Invalid version format. Must be in the format: X.X.X such as 2.0.1"
  end
end
 

module Appcelerator
  class Boot

    def Boot.boot

      config = Appcelerator::Installer.load_config
      
      username=nil
      password=nil
      save=false
      
      if not OPTIONS[:server]
        OPTIONS[:server] = config[:server] || ET_PHONE_HOME
      end
      
      return nil if OPTIONS[:no_remote]
      
      if config[:username] and config[:password]

        # nothing required
        
      elsif ACTION.to_s != 'network:login'  

        # first time user - we need to either allow them to signup or allow them to login
        
        puts 
        puts '*' * 80
        puts ' ' * 20 + 'Welcome to the Appcelerator RIA Platform'
        puts '*' * 80
        puts
        puts 'Before we can continue, you will need your Appcelerator Developer Network login'
        puts 'credentials.  If you have not yet created a (free) developer account, you can '
        puts 'either visit http://www.appcelerator.org to create one and return.  Or, you can'
        puts 'create an account now.'
        puts 
        puts 
        
        yn = ask 'Do you have an account? (Y)es or (N)o [Y]'

        if ['y','Y',''].index(yn)
    			Installer.login(username,password)
          puts "Welcome back ...."
          puts
                    
        else
          #
          # don't have an account - we need to collect information for signup
          #
          puts 
          puts "OK, let's sign you up to the Appcelerator Developer Network.  We'll need "
          puts "a little bit of information to get you signed up.  Here we go:"
          puts
          username = Installer.prompt_username 'Email'
          Installer.prompt_proxy(true)
          firstname = ask 'Firstname:'
          lastname = ask 'Lastname:'
          password = Installer.prompt_password
          Installer.prompt_password password
          
          puts 
          puts "Signing you up .... one moment please."
          puts
          
          result = Installer.signup(username,firstname,lastname,password)
          
          if not result['success']
            die "Signup failed. #{result['msg']}"
          end
          
          puts "Signup almost complete.  You will now need to check your email address"
          puts "at #{username} for a validation email.  In this email, you will find a "
          puts "four-character verification code.  Please enter that code below or press"
          puts "return if you have already verified your account by clicking on the URL"
          puts "in the email."
          puts
          
          attempt_login = true
          
          while true
            verification = ask 'Verification code:'
            if verification.nil? or verification == ''
              if Installer.network_login(username,password)
                attempt_login = false
                break
              else
                puts "Couldn't not validate your account. Please try again."
              end
            else
              result = Installer.validate_signup(username,password,verification)
              if result and result['success']
                break
              else
                puts "Error validating your verification code. #{result['msg']}"
              end
            end
          end
          
          puts
          puts "Congratulations! You're now signed up and verified."
          puts
          puts '*' * 80
          puts
    			
          Installer.network_login(username,password) if attempt_login
          
        end

        save = true
      end
      
      # save the config
      Installer.save_config(username,password) if save
      
      # make sure we've got our initial admin pulled down
      Installer.check_appadmin_installed

    end
    
  end
end

