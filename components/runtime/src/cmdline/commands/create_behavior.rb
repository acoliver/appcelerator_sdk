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
CommandRegistry.registerCommand('create:behavior','create a new behavior project',[
  {
    :name=>'path',
    :help=>'path to directory where behavior should be created',
    :required=>true,
    :type=>[
      Types::FileType,
      Types::DirectoryType,
      Types::AlphanumericType
    ],
    :conversion=>Types::DirectoryType
  },
  {
    :name=>'name',
    :help=>'name of the behavior to create (such as my_behavior)',
    :required=>true,
    :type=>Types::StringType
  }
],nil,[
  'create:behavior c:\tmp mybehavior',
  'create:behavior ~/mydir mybehavior'
]) do |args,options|
  
  name = args[:name]
  
  if not name =~ /^[\w\d_]+$/
    message = <<-ERROR_MESSAGE
Invalid behavior name

User-defined behaviors must be one or more alphanumeric word/letter combinations

  > my_behavior_foo
  > mybehavior
  > my1behavior
ERROR_MESSAGE
    raise UserError.new(message)
  end
  
  out_dir = args[:path].path

  if Installer.is_project_dir?(out_dir)
    config = Project.get_config(out_dir)
    out_dir = config[:behaviors]
  end
  
  dir = File.expand_path(File.join(out_dir,name))
  
  Installer.mkdir dir unless File.exists? dir
  
  event = {:dir=>dir,:name=>name}

  PluginManager.dispatchEvents('create_behavior',event) do
    
    template_dir = "#{File.dirname(__FILE__)}/templates"
    
    template = File.read "#{template_dir}/behavior.js"
    template.gsub! 'NAME', name
    
    FileUtils.cp "#{template_dir}/LICENSING.readme", "#{dir}/LICENSING.readme" 
    Installer.put "#{dir}/#{name}.js", template

    template = File.read "#{template_dir}/component_Rakefile"
    template.gsub! 'COMPONENT_NAME', name.downcase
    template.gsub! 'COMPONENT_TYPE', 'behavior'
    template.gsub! 'COMPONENT', name.upcase
    template.gsub! 'Component', name[0,1].upcase + name[1..-1].downcase
    
    Installer.put "#{dir}/Rakefile", template
    
    build_config = {
      :name=>name,
      :version=>1.0,
      :type=>'behavior',
      :description=>"#{name} behavior",
      :release_notes=>"initial release",
      :tags=> ['behavior'],
      :licenses=>[]
    }
    
    Installer.put "#{dir}/build.yml", build_config.to_yaml.to_s
  end
  
  puts "Created Behavior: #{args[:name]} in #{dir}" unless OPTIONS[:quiet]
end
