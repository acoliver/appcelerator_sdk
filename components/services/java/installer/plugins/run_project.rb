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

      port = options[:port]
      scanperiod = options[:scan_period]
      sep = RUBY_PLATFORM=~/win32/ ? ';' : ':'
      pathsep = RUBY_PLATFORM=~/win32/ ? '\\' : '/'
      FileUtils.cd Dir.pwd do |dir|
        webdir = "public"
        servicesdir = "app/services"
        jars = Dir["lib/**/**"].inject([]) do |jars,file|
          jars << "#{file}".gsub(/\//,pathsep) if File.extname '.jar'
        end
        props = []
        OPTIONS.each do |k,v|
          props << "-#{k}=#{v}" if k.to_s[0,1]=='D'
          props << "-#{k}" if k.to_s[0,1]=='X'
        end
        props = props.join(' ')
        cp = "#{servicesdir}"
        cp << sep
        if File.exists?("output/classes")
          cp << "output#{pathsep}classes" 
          cp << sep
        end
        cp << jars.join(sep)
        cmd = "java -cp #{cp} #{props} org.appcelerator.endpoint.HTTPEndpoint #{port} #{webdir} #{servicesdir} #{scanperiod}"
        puts cmd if OPTIONS[:debug]
        
        event = {:project_dir=>pwd,:service=>'java'}
        PluginManager.dispatchEvents('run_server',event) do
          if not system(cmd)
            puts "Failed to launch jetty, you need to have java installed and on your path."
          end
        end
      end
    end
  end
end