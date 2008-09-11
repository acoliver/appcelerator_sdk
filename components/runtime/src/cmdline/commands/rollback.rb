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
CommandRegistry.registerCommand('rollback:project','rollback project change (install, update)',[
  {
    :name=>'path',
    :help=>'path of the project',
    :required=>false,
    :default=>nil,
    :type=>[
      Types::FileType,
      Types::DirectoryType,
      Types::AlphanumericType
    ],
    :conversion=>Types::DirectoryType
  }
],nil,[
  'rollback',
  'rollback ~/myproject'
], :project) do |args,options|

  pwd = File.expand_path(args[:path] || Dir.pwd)

  fail = false

  FileUtils.cd(pwd) do 
    # this is used to make sure we're in a project directory
    project = Project.load(pwd)
  
    rollback_dir = project.get_path(:tmp) + '/rollback'
  
    if not File.exists?(rollback_dir)
      STDERR.puts "No rollbacks found for project at #{pwd}"
      fail = true
    else
      manifest = YAML::load_file "#{rollback_dir}/manifest.yml"

      puts "Found rollback for command =>  #{manifest[:cmdline]}"
      puts "which was executed on #{manifest[:time]}"
      puts "This command affected #{manifest[:count]} affected files/directories"
      puts

      confirm "Are you sure you want to rollback changes? [yN] ",false,true,'n'

      tx = IOTransaction.new pwd,true,OPTIONS[:verbose]||OPTIONS[:debug]
      tx.rollback

      puts "Rollback complete...."
    
      FileUtils.rm_rf rollback_dir
    end

  end

  die if fail
end

