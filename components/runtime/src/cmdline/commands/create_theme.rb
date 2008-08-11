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
    :name=>'name',
    :help=>'name of the control:theme to create (such as input:my_theme)',
    :required=>true,
    :type=>Types::StringType
  },
  {
    :name=>'type',
    :help=>'type of theme to create such as control (default) or behavior',
    :required=>false,
    :default=>'control',
    :type=>Types::StringType
  }
],nil,[
  'create:theme c:\tmp input:mytheme',
  'create:theme ~/mydir panel:mytheme control'
]) do |args,options|
  
  name = args[:name]
  
  if not name =~ /^[\w\d_]+:[\w\d_]+$/
    message = <<-ERROR_MESSAGE
Invalid theme name

User-defined themes must be one or more alphanumeric word/letter combinations 
where the first part if the control separate with colon and the name of the theme 
as the second part

  > input:my_theme_foo
  > panel:mytheme
  > select:my1theme
ERROR_MESSAGE
    raise UserError.new(message)
  end

  control_type = args[:type]
  control = args[:name][0,args[:name].index(':')]
  theme_name = args[:name][args[:name].index(':')+1..-1]
  
  out_dir = args[:path].path

  if Installer.is_project_dir?(out_dir)
    config = Project.get_config(out_dir)
    out_dir = File.join(config[:controls],control,'themes')
  end
  
  ##TODO: do we have control installed?
  
  dir = File.expand_path(File.join(out_dir,theme_name))
  
  ##TODO: exists?
  
  Installer.mkdir dir unless File.exists? dir
  
  event = {:dir=>dir,:name=>name,:control=>control,:theme=>theme_name}

  PluginManager.dispatchEvents('create_theme',event) do
    
    template_dir = "#{File.dirname(__FILE__)}/templates"
    
    template = File.read "#{template_dir}/theme.js"
    template.gsub! 'TYPE', control
    template.gsub! 'THEME', theme_name
    
    FileUtils.cp "#{template_dir}/LICENSING.readme", "#{dir}/LICENSING.readme" 
    Installer.put "#{dir}/#{theme_name}.js", template

    if File.exists? "#{template_dir}/#{control}_theme.css"
      template = File.read "#{template_dir}/#{control}_theme.css"
      template.gsub! 'NAME', theme_name
      Installer.put "#{dir}/#{theme_name}.css" , template
    else
      Installer.put "#{dir}/#{theme_name}.css", ''
    end
    
    template = File.read "#{template_dir}/component_Rakefile"
    template.gsub! 'COMPONENT_NAME', theme_name
    template.gsub! 'COMPONENT_TYPE', 'theme'
    template.gsub! 'COMPONENT_ZIP', name.downcase.gsub(':','_')
    template.gsub! 'COMPONENT', theme_name.upcase
    template.gsub! 'Component', theme_name[0,1].upcase + theme_name[1..-1].downcase
    
    Installer.put "#{dir}/Rakefile", template
    
    build_config = {
      :name=>name,
      :version=>1.0,
      :type=>'theme',
      :control=>control_type,
      :description=>"#{control} #{theme_name} theme",
      :release_notes=>"initial release",
      :tags=> ['theme'],
      :licenses=>[]
    }
    
    FileUtils.mkdir "#{dir}/images"
    Installer.put "#{dir}/build.yml", build_config.to_yaml.to_s
  end
  
  puts "Created Theme: #{args[:name]} in #{dir}" unless OPTIONS[:quiet]
  
end
