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

include Appcelerator
CommandRegistry.makeGroup(:network) do |group|

  group.registerCommand('login','login to the Appcelerator network',
  [
    {
      :name=>'email',
      :help=>'email address to use for login',
      :required=>true,
      :default=>nil,
      :type=>Types::AnyType
    },
    {
      :name=>'password',
      :help=>'password to use for login',
      :required=>false,
      :default=>nil,
      :type=>Types::AnyType
    }
  ]) do |args,options|

    password = args[:password] || ask('Enter your password: ',true)
    if Installer.login(args[:email],password,true)
      puts "Logged in! Welcome back." unless OPTIONS[:quiet]
    end
  end


  group.registerCommand('logout','logout of the Appcelerator network',nil,nil,nil) do |args,options|
    Installer.forget_credentials
    puts "You have been logged out.  See ya later!"
  end


  group.registerCommand('setproxy','set your proxy settings',
  [
    {
      :name=>'proxy',
      :help=>'url for the proxy (ex: http://myuser:mypass@my.example.com:3128)',
      :required=>false,
      :default=>nil,
      :type=>Types::AnyType
    }
  ]) do |args,options|
    
    if args[:proxy]
      Installer.save_proxy(args[:proxy])
    else
      Installer.prompt_proxy(true)
    end
  end
  
  group.registerCommand('clearproxy','clear your proxy settings') do |args,options|
    Installer.save_proxy(nil)
  end

end
