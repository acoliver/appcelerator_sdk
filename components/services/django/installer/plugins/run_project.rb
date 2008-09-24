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
class RunDjangoPythonPlugin < Appcelerator::Plugin
  
  def plugin_registered
    
    CommandRegistry.registerCommand('run:project',
    'run this Appcelerator project with the Django development server', [
    ],[
      {
         :name=>:port,
         :display=>'--port=port',
         :help=>'port to listen for requests.',
         :default=>'',
         :value=>true
      },
      {
         :name=>:args,
         :display=>'--args=...',
         :help=>'additional arguments to pass to the Django development server',
         :default=>nil,
         :value=>true
      }
      ],
      nil,
      :project) do |args,options|
      
      port = options[:port]
      args = options[:args]
      project_dir = Dir.pwd
      
      config = PythonConfig.new
      run_cmd = "#{config.python} manage.py runserver #{port} #{args}"
      
      puts cmd if OPTIONS[:verbose]
    
      event = {:project_dir=>project_dir ,:service=>'django'}
      PluginManager.dispatchEvents('run_server',event) do
        system(cmd)
        if $?.exitstatus == 127
            puts 'unable to run server, command not found'
        end
      end
    end
  end
end
