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
],nil,nil) do |args,options|
  
  pwd = File.expand_path(args[:path] || Dir.pwd)
  FileUtils.cd(pwd) do 
    case Appcelerator::Project.get_service
      when 'java'
        port = options[:port] || 4000
        scanperiod = options[:scan_period] || 5000
        webdir = "#{pwd}/public"
        servicesdir = "#{pwd}/app/services"

        jars = Dir["#{pwd}/lib/**/**"].inject([]) do |jars,file|
          jars << file if File.extname '.jar'
        end
        props=[]
        OPTIONS.each do |k,v|
          props << "-#{k}=#{v}" if k.to_s[0,1]=='D'
          props << "-#{k}" if k.to_s[0,1]=='X'
        end
        props=props.join(' ')
        sep = RUBY_PLATFORM=~/win32/ ? ';' : ':'
        cp = "#{pwd}/stage/java/classes"
        cp << sep
        cp << "#{pwd}/output/classes" if File.exists?("#{pwd}/output/classes")
        cp << sep
        cp << jars.join(sep)
        #TODO: add src/java to classpath after compile
        cmd = "java -cp #{cp} #{props} org.appcelerator.endpoint.HTTPEndpoint #{port} #{webdir} #{servicesdir} #{scanperiod}"
        puts cmd if OPTIONS[:debug]
        event = {:project_dir=>pwd,:service=>'java'}
        Appcelerator::PluginManager.dispatchEvent 'before_run_server',event
        begin
          system cmd
        ensure
          Appcelerator::PluginManager.dispatchEvent 'after_run_server',event
        end
      when 'ruby'
        event = {:project_dir=>pwd,:service=>'ruby'}
        Appcelerator::PluginManager.dispatchEvent 'before_run_server',event
        begin
          server = ''
          server = options[:server] if options[:server]
          args = ''
          includes = %w(port p binding b daemon d debugger u environment e help h)
          single = %w(daemon debugger help)
          map = {:p=>:port,:b=>:binding,:d=>:daemon,:u=>:debugger,:e=>:environment,:h=>:help}
          options.each do |k,v|
            next unless includes.include? k.to_s
            k = map[k] if k.to_s.length == 1
            if single.include? k.to_s
              args << "--#{k.to_s} " 
            else
              args << "--#{k.to_s}=#{v} "
            end
          end
          puts "#{pwd}/script/server #{server} #{args}" if OPTIONS[:verbose]
          system "#{pwd}/script/server #{server} #{args}"
        ensure
          Appcelerator::PluginManager.dispatchEvent 'after_run_server',event
        end
    else
      die "This command is only supported currently for Java and Ruby"
    end  
  end
  
end