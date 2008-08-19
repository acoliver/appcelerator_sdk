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


module Appcelerator
  class Dotnet
    def create_project(from_path,to_path,config,tx)
      src_dir = to_path + '/src'
      public_dir = to_path + '/public'
      sb_dir = public_dir + '/bin'
      
      tx.mkdir src_dir
      tx.mkdir public_dir
      tx.mkdir sb_dir
      
      Appcelerator::Installer.copy(tx,from_path,src_dir,["#{__FILE__}",'appcelerator.xml'])
      Appcelerator::Installer.copy(tx,from_path + '/appcelerator.xml',public_dir)
      Appcelerator::Installer.copy(tx,from_path + '/TestService.dll',public_dir + "/../app/services/")
      Appcelerator::Installer.copy(tx,from_path + '/web.config',public_dir)
      Appcelerator::Installer.copy(tx,from_path + '/ServiceBroker.app',public_dir)
      
      #Avoid funky "Error: Is a directory" error
      Appcelerator::Installer.copy(tx,from_path + '/bin/Release/Appcelerator.dll',sb_dir + '/Appcelerator.dll')
      true
    end
  end
end


