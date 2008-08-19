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
