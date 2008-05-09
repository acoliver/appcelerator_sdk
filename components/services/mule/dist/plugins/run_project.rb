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
