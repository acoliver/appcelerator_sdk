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

module Appcelerator
  class Boot

    def Boot.boot

      config = Appcelerator::Installer.load_config
      username,password=nil
      save=false
      
      if config['username'] and config['password']

        # nothing required
        
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
      			break if Appcelerator::Installer.login(username,password)
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
      
      Appcelerator::Installer.save_config if save
    end
    
  end
end

