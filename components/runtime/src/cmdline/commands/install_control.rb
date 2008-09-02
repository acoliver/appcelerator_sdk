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
CommandRegistry.registerCommand('install:control','install a control',[
  {
    :name=>'location',
    :help=>'path or URL to control file or name of the control in the network',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],[
  {
    :name=>'version',
    :display=>'--version=X.X.X',
    :help=>'version of the control to add',
    :value=>true
  }
],[
  'install:control my_control',
  'install:control my_control1,my_control2',
  'install:control my_control.zip,your_control.zip',
  'install:control http://myurl.com/foo_control.zip'
]) do |args,options|

  control_names = args[:location].split(',').uniq
  control_names.each do |control|
    Installer.require_component(:control, control.strip, options[:version])
  end
end
