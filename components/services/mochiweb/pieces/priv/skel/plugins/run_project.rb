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
class RunMochiwebPlugin < Appcelerator::Plugin
  
  def plugin_registered
    
    CommandRegistry.registerCommand('run:project',
    'run the Appcelerator-enabled mochiweb server', [
      {
        :name=>'path',
        :help=>'directory to run in, defaults to working directory',
        :required=>false,
        :default=>nil,
        :type=>[
          Types::FileType,
          Types::DirectoryType,
          Types::AlphanumericType
        ],
        :conversion=>Types::DirectoryType
      }
    ],[
      {
         :name=>:args,
         :display=>'--args=...',
         :help=>'additional arguments to pass to the server',
         :default=>nil,
         :value=>true
      }
      ],
      nil,
      :project) do |args,options|
      
      pwd = File.expand_path(args[:path] || Dir.pwd)
      args = options[:args]
      FileUtils.cd pwd do
        cmd = "make && ./start-dev.sh #{args}"
        puts cmd if OPTIONS[:verbose]
    
        event = {:project_dir=>pwd,:service=>'mochiweb'}
        PluginManager.dispatchEvents('run_server',event) do
          system(cmd)
          if $?.exitstatus == 127
            puts 'An error occured, which isn\'t too surprising'
          end
        end
      end
    end
  end
end