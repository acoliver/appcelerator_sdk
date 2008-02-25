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


Appcelerator::CommandRegistry.registerCommand('network:login','login to the Appcelerator network',
[
  {
    :name=>'email',
    :help=>'email address to use for login',
    :required=>true,
    :default=>nil,
    :type=>Appcelerator::Types::AnyType
  },
  {
    :name=>'password',
    :help=>'password to use for login',
    :required=>false,
    :default=>nil,
    :type=>Appcelerator::Types::AnyType
  }
],nil,nil) do |args,options|
  
  password = args[:password] || ask('Enter your password: ',true)
  if Appcelerator::Installer.login(args[:email],password,true)
    puts "Logged in! Welcome back."
  end
end


Appcelerator::CommandRegistry.registerCommand('network:logout','logout of the Appcelerator network',nil,nil,nil) do |args,options|
  Appcelerator::Installer.forget_credentials
  puts "You have been logged out.  See ya later!"
end

Appcelerator::CommandRegistry.registerCommand('network:list','query network for list of distributions',
[
  {
    :name=>'type',
    :help=>'type of component to list (widget,plugin,etc...)',
    :required=>false,
    :default=>nil,
    :type=>Appcelerator::Types::AnyType
  },
  {
    :name=>'name',
    :help=>'name of component to list',
    :required=>false,
    :default=>nil,
    :type=>Appcelerator::Types::AnyType
  }
],nil,nil) do |args,options|
  list = Appcelerator::Installer.fetch_distribution_list
  if args[:type]
    l = list[args[:type]] || list[args[:type].to_sym]
    if l
      if args[:name]
        l.each do |e|
          if e[:name] == args[:name]
            puts e.to_yaml
            break
          end
        end
      else
        puts l.to_yaml
      end
    else
      die "Couldn't find component type: '#{args[:type]}'"
    end
  else
    puts list.to_yaml
  end
end
