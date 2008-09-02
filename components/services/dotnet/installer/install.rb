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


