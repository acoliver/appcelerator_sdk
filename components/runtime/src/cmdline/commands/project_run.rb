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

#TODO: move this into service-specific plugin

Appcelerator::CommandRegistry.registerCommand('project:run','run a project server',[
  {
    :name=>'path',
    :help=>'path of the project to add the plugin to',
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
     :name=>:server,
     :display=>'--server=servername',
     :help=>'server to use. for example: webrick',
     :value=>true
  },
  {
     :name=>:port,
     :display=>'--port=port',
     :help=>'port to listen for requests. for example, 5000',
     :value=>true
  },
  {
    :name=>:scan_period,
    :display=>'--scan-period=ms',
    :help=>'scan period in milliseconds (defaults to 5000)',
    :value=>true
  }
],nil) do |args,options|
  
  pwd = File.expand_path(args[:path] || Dir.pwd)
  FileUtils.cd(pwd) do 
    case Appcelerator::Project.get_service
      when 'java'
        port = options[:port] || 4000
        scanperiod = options[:scan_period] || 5000
        webdir = "#{pwd}/public"
        servicesdir = "#{pwd}/app/services"

        jars = Dir["#{pwd}/lib/**/**"].inject([]) do |jars,file|
          jars << "\"#{file}\"" if File.extname '.jar'
        end
        props=[]
        OPTIONS.each do |k,v|
          props << "-#{k}=#{v}" if k.to_s[0,1]=='D'
          props << "-#{k}" if k.to_s[0,1]=='X'
        end
        props=props.join(' ')
        sep = RUBY_PLATFORM=~/win32/ ? ';' : ':'
        cp = "\"#{servicesdir}\""
        cp << sep
        cp << "\"#{pwd}/output/classes\"" if File.exists?("#{pwd}/output/classes")
        cp << sep
        cp << jars.join(sep)
        cmd = "java -cp #{cp} #{props} org.appcelerator.endpoint.HTTPEndpoint #{port} #{webdir} #{servicesdir} #{scanperiod}"
        puts cmd if OPTIONS[:debug]
        event = {:project_dir=>pwd,:service=>'java'}
        Appcelerator::PluginManager.dispatchEvent 'before_run_server',event
        begin
          if not system cmd
            STDERR.puts "Error executing: #{cmd}"
          end
        ensure
          Appcelerator::PluginManager.dispatchEvent 'after_run_server',event
        end
      when 'ruby'
        event = {:project_dir=>pwd,:service=>'ruby'}
        Appcelerator::PluginManager.dispatchEvent 'before_run_server',event
        begin
          server = ''
          server = options[:server] if options[:server]
          port = options[:port] || 3000
          args = options[:args] || ''
          args << " --port=#{port}"
          puts "#{pwd}/script/server #{server} #{args}" if OPTIONS[:verbose]
          system "#{pwd}/script/server #{server} #{args}"
        ensure
          Appcelerator::PluginManager.dispatchEvent 'after_run_server',event
        end
      when 'python'
        event = {:project_dir=>pwd,:service=>'ruby'}
        Appcelerator::PluginManager.dispatchEvent 'before_run_server',event
        begin
          if RUBY_PLATFORM =~ /(:?mswin|mingw)/
            paster = Dir['C:/Python2*/Scripts/paster.exe'].last
          else
            paster = 'paster'
          end
          
          ini_file = options[:ini_file] || 'development.ini'
          reload = options[:no_reload] ? '' :  '--reload'
          port = options[:port] || 5000
          args = options[:args] || ''
          
          puts "#{paster} serve #{ini_file} #{reload} http_port=#{port} #{args}" if OPTIONS[:verbose]
          system "#{paster} serve #{ini_file} #{reload} http_port=#{port} #{args}"
        ensure
          Appcelerator::PluginManager.dispatchEvent 'after_run_server',event
        end        
    else
      die "This command is currently only supported for Java, Ruby, Python"
    end  
  end
  
end