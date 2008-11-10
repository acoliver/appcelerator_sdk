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


require File.dirname(__FILE__) + '/python_config.rb'

include Appcelerator
class RunPythonPlugin < Appcelerator::Plugin
  
  def plugin_registered
    
    CommandRegistry.registerCommand('run:project',
    'run this Appcelerator project with the Paste server', [
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
         :default=>4000,
         :value=>true
      },
      {
         :name=>:ini_file,
         :display=>'--ini_file=something.ini',
         :help=>'initialization file to use for configuring the app.',
         :default=>'development.ini',
         :value=>true,
         :type=>[
           Types::FileType,
           Types::AlphanumericType
         ],
         :conversion=>Types::FileType
      },
      {
         :name=>:no_reload,
         :display=>'--no-reload',
         :help=>'don\'t reload app when source files change',
         :default=>nil,
         :value=>false
      },
      {
         :name=>:args,
         :display=>'--args=...',
         :help=>'additional arguments to pass to the Paste server',
         :default=>nil,
         :value=>true
      }
      ],
      nil,
      :project) do |args,options|
      
      pwd = File.expand_path(args[:path] || Dir.pwd)
      ini_file = options[:ini_file]
      reload = options[:no_reload] ? '' :  '--reload'
      port = options[:port]
      args = options[:args]
      config = PythonConfig.new
      
      cmd = "#{config.paster} serve \"#{ini_file}\" #{reload} http_port=#{port} #{args}"
      puts cmd if OPTIONS[:verbose]
      
      event = {:project_dir=>pwd,:service=>'python'}
      PluginManager.dispatchEvents('run_server',event) do
        system(cmd)
        if $?.exitstatus == 127
          puts 'The "paster" command was not found or failed with an error. Please check that Paste (http://pythonpaste.org/) is installed and on your PATH.'
        end
      end
    end
  end
end