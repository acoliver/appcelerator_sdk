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

TITANIUM_OS_TYPES = %w(win32 osx linux) 

CommandRegistry.registerCommand('package:project', 'package a Titanium app as a native executable', [
  {
    :name=>'os',
    :help=>'operating system',
    :required=>false,
    :default=>TITANIUM_OS_TYPES,
    :type=>[
      Types::EnumerationType.new(TITANIUM_OS_TYPES)
    ],
    :conversion=>Types::EnumerationType
  },
  {
    :name=>'dest',
    :help=>'destination directory of output',
    :required=>false,
    :default=>'stage',
    :type=>[
      Types::DirectoryType
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
  }
], [
  'package:project',
  'package:project osx',
  'package:project --launch',
  'package:project osx,win32',
  'package:project osx --launch',
  'package:project osx --dest=/tmp'
]) do |args,options|
    project = Project.load(Dir.pwd)
    options[:quiet_if_installed]=true unless options[:quiet_if_installed]
    dest_dir = args[:dest]
    FileUtils.mkdir_p dest_dir unless File.exists?(dest_dir)
    args[:os].each do |os|
      event = {:project=>project, :tx=>nil, :os=>os.to_s}
      PluginManager.dispatchEvents('package_project', event) do
        runtime = Installer.require_component(:titanium, os.to_sym, options[:version], options)
        require File.join(runtime[:dir],'packager.rb')
        cls = eval "Titanium::#{os.upcase}::Packager"
        puts "Packaging Titanium for target os: #{os}" unless options[:quiet]
        cls.package(project,dest_dir,runtime[:version])
        event[:success] = true
      end
    end
    if args[:os].length == 1
      puts "Your Titanium application is located in #{dest_dir}" unless options[:quiet]
    else
      puts "Your Titanium applications are located in #{dest_dir}" unless options[:quiet]
    end
end
