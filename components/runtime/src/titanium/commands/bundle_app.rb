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

CommandRegistry.registerCommand('bundle:app', 'bundle a Titanium app as a native executable', [
  {
    :name=>'path',
    :help=>'path to bundle',
    :required=>false,
    :default=>nil,
    :type=>[
      Types::FileType,
      Types::DirectoryType,
      Types::AlphanumericType
    ],
    :conversion=>Types::DirectoryType
  },
  {
    :name=>'executable_name',
    :help=>'name of the executable',
    :required=>false,
    :default=>nil,
    :type=>[
      Types::AlphanumericType
    ],
    :conversion=>Types::AnyType
  },
  {
    :name=>'destination',
    :help=>'destination directory of the executable',
    :required=>false,
    :default=>nil,
    :type=>[
      Types::FileType,
      Types::DirectoryType,
      Types::AlphanumericType
    ],
    :conversion=>Types::DirectoryType
  }
], [
  {
    :name=>'endpoint',
    :display=>'--endpoint=http://www.yourserver.com',
    :help=>'set the remote service endpoint for an Appcelerator app (allows remote services)',
    :value=>nil
  },
  {
    :name=>'launch',
    :display=>"--launch",
    :help=>"launch the project after bundling",
    :value=>true
  },
  {
    :name=>'xml',
    :display=>'--xml',
    :help=>'specify the path to your tiapp.xml',
    :value=>nil
  }
], [
  'bundle:app',
  'bundle:app ~/myapp',
  'bundle:app ~/myapp MyApp',
  'bundle:app ~/myapp MyApp --xml=mytiapp.xml',
  'bundle:app ~/myapp MyApp ~/bin'
]) do |args,options|
    Titanium::Titanium.init
    
    path = File.expand_path(args[:path] || Dir.pwd)
    project = nil
    if Project.is_project_dir?(path)
      project = options[:project] || Project.load(path)
    end
    executable_name = args[:executable_name] || project.nil? ? File.basename(path) : project.config[:name]
    dest = args[:destination] || project.nil? ? path : project.path
    
    Bundler.bundle_app(path, executable_name, dest, options[:endpoint], options[:launch], options[:xml])
end