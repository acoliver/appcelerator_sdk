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
CommandRegistry.registerCommand('create:theme','create a new theme project',[
  {
    :name=>'path',
    :help=>'path to directory where theme should be created',
    :required=>true,
    :type=>[
      Types::FileType,
      Types::DirectoryType,
      Types::AlphanumericType
    ],
    :conversion=>Types::DirectoryType
  },
  {
    :name=>'control',
    :help=>'name of the control (such as input)',
    :required=>true,
    :type=>Types::StringType
  },
  {
    :name=>'name',
    :help=>'name of the theme to create (such as my_theme)',
    :required=>true,
    :type=>Types::StringType
  }
],nil,[
  'create:theme c:\tmp input mytheme',
  'create:theme ~/mydir panel mytheme'
]) do |args,options|
  
  name = args[:name]
  
  if not name =~ /^[\w\d_]+$/
    message = <<-ERROR_MESSAGE
Invalid theme name

User-defined themes must be one or more alphanumeric word/letter combinations

  > my_theme_foo
  > mytheme
  > my1theme
ERROR_MESSAGE
    raise UserError.new(message)
  end
  
  out_dir = args[:path].path

  if Installer.is_project_dir?(out_dir)
    config = Project.get_config(out_dir)
    out_dir = File.join(config[:controls],args[:control],'themes')
  end
  
  ##TODO: do we have control installed?
  
  dir = File.expand_path(File.join(out_dir,name))
  
  ##TODO: exists?
  
  Installer.mkdir dir unless File.exists? dir
  
  event = {:dir=>dir,:name=>name,:control=>args[:control]}

  PluginManager.dispatchEvents('create_theme',event) do
    
    template_dir = "#{File.dirname(__FILE__)}/templates"
    
    template = File.read "#{template_dir}/theme.js"
    template.gsub! 'TYPE', args[:control]
    template.gsub! 'THEME', name
    
    FileUtils.cp "#{template_dir}/LICENSING.readme", "#{dir}/LICENSING.readme" 
    Installer.put "#{dir}/#{name}.js", template

    if File.exists? "#{template_dir}/#{args[:control]}_theme.css"
      template = File.read "#{template_dir}/#{args[:control]}_theme.css"
      template.gsub! 'NAME', name
      Installer.put "#{dir}/#{name}.css" , template
    else
      Installer.put "#{dir}/#{name}.css", ''
    end
    
    template = File.read "#{template_dir}/component_Rakefile"
    template.gsub! 'COMPONENT_NAME', name.downcase
    template.gsub! 'COMPONENT_TYPE', 'theme'
    template.gsub! 'COMPONENT', name.upcase
    template.gsub! 'Component', name[0,1].upcase + name[1..-1].downcase
    
    Installer.put "#{dir}/Rakefile", template
    
    build_config = {
      :name=>name,
      :control=>args[:control],
      :version=>1.0,
      :type=>'theme',
      :description=>"#{args[:control]} #{name} theme",
      :release_notes=>"initial release",
      :tags=> ['theme'],
      :licenses=>[]
    }
    
    FileUtils.mkdir "#{dir}/images"
    Installer.put "#{dir}/build.yml", build_config.to_yaml.to_s
  end
  
  puts "Created Theme: #{args[:name]} in #{dir}" unless OPTIONS[:quiet]
  
end
