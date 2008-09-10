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
class RunAppEnginePythonPlugin < Appcelerator::Plugin
  
  def plugin_registered
    
    CommandRegistry.registerCommand('run:project',
    'run this Appcelerator project with the App Engine development server', [
    ],[
      {
         :name=>:port,
         :display=>'--port=port',
         :help=>'port to listen for requests.',
         :default=>8080,
         :value=>true
      },
      {
         :name=>:args,
         :display=>'--args=...',
         :help=>'additional arguments to pass to the App Engine development server',
         :default=>nil,
         :value=>true
      }
      ],
      nil,
      :project) do |args,options|
      
      port = options[:port]
      args = options[:args]
      project_dir = Dir.pwd
      
      cmd_name = 'dev_appserver.py'
      config = PythonConfig.new
      if config.on_windows
        begin
            # this is like running: python `which dev_appserver.py`
            path = ENV['PATH']
            path.match(/;([^;]*google_appengine[^;]*)/)
            cmd_path = File.join($1,cmd_name)
            run_cmd = "#{config.python} \"#{cmd_path}\""
        rescue 
          puts 'The "dev_appserver.py" command was not found. Please check that the Google App Engine is installed and that the "dev_appserver.py" command is on your PATH.'
        end
      else
        run_cmd = cmd_name
      end
      
      cmd = "#{run_cmd} \"#{project_dir}\" --port=#{port} #{args}"
      puts cmd if OPTIONS[:verbose]
    
      event = {:project_dir=>project_dir ,:service=>'appengine'}
      PluginManager.dispatchEvents('run_server',event) do
        system(cmd)
        if $?.exitstatus == 127
          puts 'The "dev_appserver.py" command was not found. Please check that the Google App Engine is installed and that the "dev_appserver.py" command is on your PATH.'
        end
      end
    end
  end
end
