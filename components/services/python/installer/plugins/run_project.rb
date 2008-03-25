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
         :value=>true
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
      
      event = {:project_dir=>pwd,:service=>'ruby'}
      PluginManager.dispatchEvents('run_server',event) do
        if not system(cmd)
          puts 'The "paster" command was not found or failed with an error. Please check that Paste (http://pythonpaste.org/) is installed and on your PATH.'
        end
      end
    end
  end
end