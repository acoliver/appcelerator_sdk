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
class DeployAppEnginePythonPlugin < Appcelerator::Plugin
  
  def plugin_registered
    
    CommandRegistry.registerCommand('deploy:project',
    'deploy this project to the Google App Engine', [
    ],[
      {
         :name=>:args,
         :display=>'--args=...',
         :help=>'additional arguments to pass to the App Engine deploy command',
         :default=>nil,
         :value=>true
      }
      ],
      nil,
      :project) do |args,options|
      
      port = options[:port]
      args = options[:args]
      project_dir = Dir.pwd

      cmd_name = 'appcfg.py'
      config = PythonConfig.new
      if config.on_windows
        path = ENV['PATH']
        path.match(/;([^;]*google_appengine[^;]*)/)
        cmd_path = File.join($1,cmd_name)
        run_cmd = "#{config.python} \"#{cmd_path}\""
      else
        run_cmd = cmd_name
      end
      
      cmd = "#{run_cmd} update \"#{project_dir}\" #{args}"
      puts cmd if OPTIONS[:verbose]
      
      event = {:project_dir=>project_dir ,:service=>'appengine'}
      PluginManager.dispatchEvents('deploy_project',event) do
        system(cmd)
        if $?.exitstatus == 127
          puts 'The "appcfg.py" command was not found. Please check that the Google App Engine is installed and that the "appcfg.py" command is on your PATH.'
        end
      end
    end
  end
end
