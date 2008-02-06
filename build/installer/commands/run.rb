# Appcelerator SDK
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#

Appcelerator::CommandRegistry.registerCommand('run','run an Appcelerator project server',nil,nil,nil) do |args,options|
  
  pwd = Dir.pwd
  
  config_file = File.join(pwd,'config','appcelerator.config')
  
  if not File.exists?(config_file)
    STDERR.puts "This directory doesn't look like an Appcelerator project. Please switch to your project directory and re-run"
    exit 1
  end
  
  config = YAML.load_file config_file
  
  case config[:language]
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
      cp << "#{pwd}/output/classes"
      cp << sep
      cp << jars.join(sep)
      #TODO: add src/java to classpath after compile
      cmd = "java -cp #{cp} #{props} org.appcelerator.v21.endpoint.HTTPEndpoint #{port} #{webdir} #{servicesdir} #{scanperiod}"
      puts cmd if OPTIONS[:debug]
      system cmd
    when 'ruby'
      system "#{pwd}/script/runner"
  else
    STDERR.puts "This command is only supported currently for Java and Ruby"
    exit 1
  end  
  
end