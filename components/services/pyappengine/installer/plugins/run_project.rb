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
      
      cmd = "dev_appserver.py \"#{project_dir}\" --port=#{port} #{args}"
      puts cmd if OPTIONS[:verbose]
    
      event = {:project_dir=>project_dir ,:service=>'pyappengine'}
      PluginManager.dispatchEvents('run_server',event) do
        if not system(cmd)
          puts 'The "dev_appserver.py" command was not found or failed with an error. Please check that the Google App Engine is installed and that the "dev_appserver.py" command is on your PATH.'
        end
      end
    end
  end
end
