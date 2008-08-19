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

include Appcelerator
class RunJavaPlugin < Appcelerator::Plugin

  def plugin_registered
    
    CommandRegistry.registerCommand('run:project',
    'run this Appcelerator project with the Jetty server', [
      {
        :name=>'path',
        :help=>'directory to run in, defaults to working directory',
        :required=>false,
        :default=>nil,
        :type=>[
          Appcelerator::Types::FileType,
          Appcelerator::Types::DirectoryType,
          Appcelerator::Types::AlphanumericType
        ],
        :conversion=>Appcelerator::Types::DirectoryType
      }
    ],[
      {
         :name=>'port',
         :display=>'--port=port',
         :help=>'port to listen for requests.',
         :default=>4000,
         :value=>true
      },
      {
        :name=>'scan_period',
        :display=>'--scan-period=ms',
        :help=>'scan period in milliseconds.',
        :default=>5000,
        :value=>true
      }
    ],
    nil,
    :project) do |args,options|

      pwd = File.expand_path(args[:path] || Dir.pwd)
      port = options[:port]
      scanperiod = options[:scan_period]
      sep = RUBY_PLATFORM=~/win32/ ? ';' : ':'
      pathsep = RUBY_PLATFORM=~/win32/ ? '\\' : '/'

      FileUtils.cd Dir.pwd do |dir|
        
        # test to make sure we have java on our path
        nullout = RUBY_PLATFORM=~/win32/ ? 'NUL' : '/dev/null'
          
        if not system "java -version 2>#{nullout}"
          puts "Failed to find java, you need to have java installed and on your path."
          exit 1
        end
          
        webdir = "public"
        servicesdir = "app/services"

        cp = Dir["public/WEB-INF/lib/**/*.jar"]
        cp << "public/WEB-INF/classes" unless not(File.exists?("public/WEB-INF/classes"))
        cp << "output/classes" unless not(File.exists?("output/classes"))
        cp << servicesdir unless not(File.exists?(servicesdir))
        cp = cp.join(sep) # make it a string
        cp = cp.gsub(/\//, pathsep)

        props = []
        OPTIONS.each do |k, v|
          props << "-#{k}=#{v}" if k.to_s[0] == ?D
          props << "-#{k}" if k.to_s[0] == ?X
        end
        props = props.join(' ')

        cmd = "java -cp #{cp} #{props} org.appcelerator.endpoint.HTTPEndpoint #{port} \"#{webdir}\" \"#{servicesdir}\" #{scanperiod}"
        puts cmd if OPTIONS[:verbose]
          
        event = {:project_dir => pwd, :service => 'java'}
        PluginManager.dispatchEvents('run_server',event) do
          system(cmd)
        end
      end
    end
  end
end
