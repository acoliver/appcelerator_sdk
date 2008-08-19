#
# This file is part of Appcelerator.
#
# Copyright (c) 2006-2008, Appcelerator, Inc.
# All rights reserved.
# 
# Redistribution and use in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
# 
#     * Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
# 
#     * Redistributions in binary form must reproduce the above copyright notice,
#       this list of conditions and the following disclaimer in the documentation
#       and/or other materials provided with the distribution.
# 
#     * Neither the name of Appcelerator, Inc. nor the names of its
#       contributors may be used to endorse or promote products derived from this
#       software without specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
        if not system(cmd)
          puts 'The "paster" command was not found or failed with an error. Please check that Paste (http://pythonpaste.org/) is installed and on your PATH.'
        end
      end
    end
  end
end