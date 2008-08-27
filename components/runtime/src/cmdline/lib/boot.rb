#
#
# This file is part of Appcelerator.
#
# Copyright (c) 2006-2008, Appcelerator, Inc.
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
tmp_dir = ENV['TMPDIR'] || ENV['TEMP'] || ENV['TMP']
if (not(tmp_dir) and File.directory?('/tmp'))
    tmp_dir = '/tmp'
else
    tmp_dir = '.'
end
APP_TEMP_DIR=FileUtils.mkdir_p(File.join(tmp_dir, "appcelerator.#{rand(10000)}.#{$$}"))

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
      
      puts "CONFIG=#{config.to_yaml}"
      
      username=nil
      password=nil
      save=false
      
      if not OPTIONS[:server]
        OPTIONS[:server] = config[:server] || ENV['UPDATESITE'] || ET_PHONE_HOME
      end
      
      return nil if OPTIONS[:no_remote]
      
      if config[:username] and config[:password]

        # nothing required
        
      elsif ACTION != 'login'  

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
      
    end
    
  end
end

