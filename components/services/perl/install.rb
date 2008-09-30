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
  class Perl
    def create_project(from_path,to_path,config,tx)
      Appcelerator::Installer.copy(tx,from_path,to_path, ['install.rb','build.yml'])
      tx.chmod(0755, "#{to_path}/public/servicebroker.pl")     
      tx.chmod(0755, "#{to_path}/public/proxy.pl")     
      true
    end
  end
end


