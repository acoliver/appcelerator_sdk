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
        if not system cmd
          puts 'Failed to run the Rails server script'
        end
      end
    end
  end
end