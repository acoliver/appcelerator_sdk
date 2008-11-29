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
[],
[
  'launch:project',
  'launch:project ~/myapp'
]) do |args,options|
    
    dir = Dir.pwd
    project = Project.load(dir)
    os = platform_string.to_sym
    dest_dir = File.expand_path(args[:path] || File.join(Dir.pwd,'stage'))
    options[:quiet_if_installed] = true unless options[:quiet_if_installed]
    FileUtils.cd(dest_dir) do
      event = {:project=>project, :tx=>nil, :os=>os.to_s}
      PluginManager.dispatchEvents('launch_project', event) do
        runtime = Installer.require_component(:titanium, os, options[:version], options)
        require File.join(runtime[:dir],'launcher.rb')
        cls = eval "Titanium::#{os.to_s.upcase}::Launcher"
        puts "Launching Titanium for target os: #{os.to_s}" unless options[:quiet]
        cls.launch(project,dir)
        event[:success] = true
      end
    end
end