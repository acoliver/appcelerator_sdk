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
        path = ENV['PATH']
        path.match(/;([^;]*google_appengine[^;]*)/)
        cmd_path = File.join($1,cmd_name)
        run_cmd = "#{config.python} \"#{cmd_path}\""
      else
        run_cmd = cmd_name
      end
      
      cmd = "#{run_cmd} \"#{project_dir}\" --port=#{port} #{args}"
      puts cmd if OPTIONS[:verbose]
    
      event = {:project_dir=>project_dir ,:service=>'appengine'}
      PluginManager.dispatchEvents('run_server',event) do
        if not system(cmd)
          puts 'The "dev_appserver.py" command was not found or failed with an error. Please check that the Google App Engine is installed and that the "dev_appserver.py" command is on your PATH.'
        end
      end
    end
  end
end
