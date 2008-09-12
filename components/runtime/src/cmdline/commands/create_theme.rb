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

  if Project.is_project_dir?(out_dir)
    project = Project.load(out_dir)
    out_dir = project.get_web_path("components/#{control}/themes")
  else
    project = nil
  end 

  dir = File.expand_path(File.join(out_dir,theme_name))
  
  ##TODO: do we have control installed?
  ##TODO: exists?
  
  Installer.mkdir dir unless File.exists? dir
  
  event = {:dir=>dir,:name=>name,:control=>control,:theme=>theme_name,:project=>project}
  PluginManager.dispatchEvents('create_theme',event) do
    
    template_dir = "#{File.dirname(__FILE__)}/templates"
    
    template = File.read "#{template_dir}/theme.js"
    template.gsub! 'TYPE', control
    template.gsub! 'THEME', theme_name
    template.gsub! 'COMPONENT', control_type
    
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
