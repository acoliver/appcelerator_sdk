# This file is part of Appcelerator.
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# Appcelerator is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

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
        if not system(cmd)
          puts 'The "appcfg.py" command was not found or failed with an error. Please check that the Google App Engine is installed and that the "appcfg.py" command is on your PATH.'
        end
      end
    end
  end
end
