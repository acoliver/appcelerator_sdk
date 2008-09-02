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
class RunRubyPlugin < Appcelerator::Plugin
  
  def plugin_registered
    
    CommandRegistry.registerCommand('run:project',
    'run this Appcelerator project on Rails', [
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
         :name=>:port,
         :display=>'--port=port',
         :help=>'port to listen for requests.',
         :default=>3000,
         :value=>true
      },
      {
         :name=>:server,
         :display=>'--server=servername',
         :help=>'server to use. for example: webrick',
         :default=>'',
         :value=>true
      },
      {
         :name=>:args,
         :display=>'--args=...',
         :help=>'additional arguments to pass to the Rails server',
         :default=>'',
         :value=>true
      }
    ],
    nil,
    :project) do |args,options|
      
      pwd = File.expand_path(args[:path] || Dir.pwd)
      server = options[:server]
      port = options[:port]
      args = options[:args]
      args << " --port=#{port}"
      
      cmd = "ruby \"#{pwd}/script/server\" #{server} #{args}"
      puts cmd if OPTIONS[:verbose]
        
      event = {:project_dir=>pwd,:service=>'ruby'}
      PluginManager.dispatchEvents('run_server',event) do
        system cmd
        if ($?.exitstatus == 127) or ($?.exitstatus == 126)
          puts 'Failed to run the Rails server script'
        end
      end
    end
  end
end