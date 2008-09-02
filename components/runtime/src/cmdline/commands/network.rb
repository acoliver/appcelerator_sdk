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
