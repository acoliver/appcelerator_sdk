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
CommandRegistry.registerCommand('create:control','create a new control project',[
  {
    :name=>'path',
    :help=>'path to directory where control should be created',
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
    :help=>'name of the control to create (such as my_control)',
    :required=>true,
    :type=>Types::StringType
  }
],nil,[
  'create:control c:\tmp mycontrol',
  'create:control ~/mydir mycontrol'
]) do |args,options|
  
  name = args[:name]
  
  if not name =~ /^[\w\d_]+$/
    message = <<-ERROR_MESSAGE
Invalid control name

User-defined controls must be one or more alphanumeric word/letter combinations

  > my_control_foo
  > mycontrol
  > my1control
ERROR_MESSAGE
    raise UserError.new(message)
  end

  out_dir = args[:path].path

  if Installer.is_project_dir?(out_dir)
    config = Project.get_config(out_dir)
    out_dir = config[:controls]
  end
  
  dir = File.expand_path(File.join(out_dir,name))
  
  Installer.mkdir dir unless File.exists? dir
  
  event = {:dir=>dir,:name=>name}

  PluginManager.dispatchEvents('create_control',event) do
    
    template_dir = "#{File.dirname(__FILE__)}/templates"
    
    template = File.read "#{template_dir}/control.js"
    template.gsub! 'NAME', name
    
    FileUtils.cp "#{template_dir}/LICENSING.readme", "#{dir}/LICENSING.readme" 
    Installer.put "#{dir}/#{name}.js", template

    template = File.read "#{template_dir}/component_Rakefile"
    template.gsub! 'COMPONENT_NAME', name.downcase
    template.gsub! 'COMPONENT_TYPE', 'control'
    template.gsub! 'COMPONENT', name.upcase
    template.gsub! 'Component', name[0,1].upcase + name[1..-1].downcase
    
    Installer.put "#{dir}/Rakefile", template
    
    build_config = {
      :name=>name,
      :version=>1.0,
      :type=>'control',
      :description=>"#{name} control",
      :release_notes=>"initial release",
      :tags=> ['control'],
      :licenses=>[]
    }
    
    Installer.put "#{dir}/build.yml", build_config.to_yaml.to_s
  end
  
  puts "Created Control: #{args[:name]} in #{dir}" unless OPTIONS[:quiet]
  
end
