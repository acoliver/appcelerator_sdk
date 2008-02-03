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
require 'yaml'

module Appcelerator
  class Installer

    def Installer.prompt_username(label='Username')
      ask_with_validation "#{label}:",'Invalid email. Please enter your email address as your username',/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
    end
    
    def Installer.prompt_password(confirm=nil)
      if confirm
        ask_with_validation 'Password (confirm):','Password did not match previous entry', Regexp.new("^#{confirm}$"), true
      else
        ask_with_validation 'Password:','Invalid password. Must be greater than 4 characters', /[.\w\d_!@#\$%_-]{4,100}/, true
      end
    end
    
    def Installer.boot
      
      config_dir = File.join(user_home,'.appc')
      
      FileUtils.mkdir(config_dir) unless File.exists?(config_dir)
      FileUtils.mkdir(RELEASE_DIR) unless File.exists?(RELEASE_DIR)
      
      # load our config
      config_file = File.join(config_dir,'appcelerator.yml')
      config = YAML::load_file(config_file) if File.exists?(config_file)
      config||={}
      
      username,password=nil
      save=false
      
      if config['username'] and config['password']

        # have an account already -- attempt to login
	      while true 
    			break if Installer.login(config['username'],config['password'])
  			  puts "Invalid credentials, please try again..."
  			  username=prompt_username
    			password=prompt_password
        end
        
        if config['username']!=username or config['password']!=password
          save=true
        end
        
      else  

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

          # have an account already
		      while true 
    			  username=prompt_username
      			password=prompt_password
      			puts
      			puts "Validating your credentials ... one moment..."
      			break if Installer.login(username,password)
    			  puts "Invalid credentials, please try again..."
          end
		  
          config['username']=username
          config['password']=password     
          
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
          username = prompt_username 'Email'
          firstname = ask 'Firstname:'
          lastname = ask 'Lastname:'
          password = prompt_password
          prompt_password password
          
          #TODO: perform signup 
          puts 
          puts "Signing you up .... one moment please."
          puts
          puts "Signup almost complete.  You will now need to check your email address"
          puts "at #{username} for a validation email.  In this email, you will find a "
          puts "four-character verification code.  Please enter that code below:"
          puts
          
          code = MD5.hexdigest(username).to_s[0..3]
          
          while true
            verification = ask_with_validation 'Verification Code:', 'Invalid verification code. Must be 4 characters', /[a-zA-Z0-9]{4}/
            break if verification == code
            puts "Verification Code Invalid. Please re-try again. Your verification code is case sensitive." if verification
          end
          
          #TODO: now send final step message to let them know verification is complete
          
          puts
          puts "Congratulations! You're now signed up."
          puts
          puts '*' * 80
          puts
          
          config['username'] = username
          config['password'] = password

    			Installer.login(username,password)
    			
        end

        # install the latest after login/signup
        Installer.install_web_sdk
        
        save = true
      end

      if save
        f = File.open(config_file,'w+')
        f.puts config.to_yaml
        f.flush
        f.close
      end
      
    end
    
    def Installer.user_home
      if ENV['HOME']
          ENV['HOME']
      elsif ENV['USERPROFILE']
          ENV['USERPROFILE']
      elsif ENV['HOMEDRIVE'] and ENV['HOMEPATH']
          "#{ENV['HOMEDRIVE']}:#{ENV['HOMEPATH']}"
      else
          File.expand_path '~'
      end
    end
  end
end

