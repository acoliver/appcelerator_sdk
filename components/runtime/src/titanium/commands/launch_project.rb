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
include Titanium

CommandRegistry.registerCommand('launch:project', 'launch a Titanium app', [
  {
    :name=>'path',
    :help=>'path to start in (starts in current directory by default)',
    :required=>false,
    :default=>nil,
    :type=>[
      Types::FileType,
      Types::DirectoryType,
      Types::AlphanumericType
    ],
    :conversion=>Types::DirectoryType
  }
],
[
  {
    :name=>'xml',
    :display=>'--xml=custom_tiapp.xml',
    :help=>'point to a specific tiapp.xml rather than looking for it in the current directory',
    :value=>nil
  }
],
[
  'launch:app',
  'launch:app ~/myapp',
  'launch:app ~/myapp --xml=custom_tiapp.xml'
]) do |args,options|
    Titanium::Titanium.init
    
    pwd = File.expand_path(args[:path] || Dir.pwd)
    tiapp_xml = File.expand_path(options[:xml] || File.join(pwd,'tiapp.xml'))
    
    if pwd
      FileUtils.cd(pwd)
      Launcher.launchApp(tiapp_xml)
    end
end