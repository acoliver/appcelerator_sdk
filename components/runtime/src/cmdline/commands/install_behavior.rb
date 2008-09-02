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
CommandRegistry.registerCommand('install:behavior','install a behavior',[
  {
    :name=>'location',
    :help=>'path or URL to behavior file or name of the behavior in the network',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],[
  {
    :name=>'version',
    :display=>'--version=X.X.X',
    :help=>'version of the behavior to add',
    :value=>true
  }
],[
  'install:behavior my_behavior',
  'install:behavior my_behavior1,my_behavior2',
  'install:behavior my_behavior.zip,your_behavior.zip',
  'install:behavior http://myurl.com/foo_behavior.zip'
]) do |args,options|

  behavior_names = args[:location].split(',').uniq
  behavior_names.each do |behavior|
    Installer.require_component(:behavior, behavior.strip, options[:version])
  end
end
