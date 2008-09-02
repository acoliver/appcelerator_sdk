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
          
        system "java -version 2>#{nullout}"
        if $?.exitstatus == 127
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
