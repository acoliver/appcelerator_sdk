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
CommandRegistry.registerCommand('selfupdate','update the command-line tools',[],[
  {
    :name=>'version',
    :display=>'--version=X.X.X',
    :help=>'version of the command-line tools to install',
    :value=>true
  }
]) do |args,options|
  version = Installer.selfupdate(options[:version], options)
  if version
    puts "Your app command is up-to-date (#{version})"
  end
end
