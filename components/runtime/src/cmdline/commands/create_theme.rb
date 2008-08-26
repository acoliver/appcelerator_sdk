#
# This file is part of Appcelerator.
#
# Copyright (c) 2006-2008, Appcelerator, Inc.
# All rights reserved.
# 
# Redistribution and use in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
# 
#     * Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
# 
#     * Redistributions in binary form must reproduce the above copyright notice,
#       this list of conditions and the following disclaimer in the documentation
#       and/or other materials provided with the distribution.
# 
#     * Neither the name of Appcelerator, Inc. nor the names of its
#       contributors may be used to endorse or promote products derived from this
#       software without specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
