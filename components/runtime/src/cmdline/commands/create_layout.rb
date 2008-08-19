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
CommandRegistry.registerCommand('create:layout','create a new layout project',[
  {
    :name=>'path',
    :help=>'path to directory where layout should be created',
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
    :help=>'name of the layout to create (such as my_layout)',
    :required=>true,
    :type=>Types::StringType
  }
],nil,[
  'create:layout c:\tmp mylayout',
  'create:layout ~/mydir mylayout'
]) do |args,options|
  
  name = args[:name]
  
  if not name =~ /^[\w\d_]+$/
    message = <<-ERROR_MESSAGE
Invalid layout name

User-defined layouts must be one or more alphanumeric word/letter combinations

  > my_layout_foo
  > mylayout
  > my1layout
ERROR_MESSAGE
    raise UserError.new(message)
  end

  out_dir = args[:path].path

  if Installer.is_project_dir?(out_dir)
    config = Project.get_config(out_dir)
    out_dir = config[:layouts]
  end
  
  dir = File.expand_path(File.join(out_dir,name))
  
  Installer.mkdir dir unless File.exists? dir
  
  event = {:dir=>dir,:name=>name}

  PluginManager.dispatchEvents('create_layout',event) do
    
    template_dir = "#{File.dirname(__FILE__)}/templates"
    
    template = File.read "#{template_dir}/layout.js"
    template.gsub! 'NAME', name
    
    FileUtils.cp "#{template_dir}/LICENSING.readme", "#{dir}/LICENSING.readme" 
    Installer.put "#{dir}/#{name}.js", template

    template = File.read "#{template_dir}/component_Rakefile"
    template.gsub! 'COMPONENT_NAME', name.downcase
    template.gsub! 'COMPONENT_TYPE', 'layout'
    template.gsub! 'COMPONENT_ZIP', name.downcase
    template.gsub! 'COMPONENT', name.upcase
    template.gsub! 'Component', name[0,1].upcase + name[1..-1].downcase
    
    Installer.put "#{dir}/Rakefile", template
    
    build_config = {
      :name=>name,
      :version=>1.0,
      :type=>'layout',
      :description=>"#{name} layout",
      :release_notes=>"initial release",
      :tags=> ['layout'],
      :licenses=>[]
    }
    
    Installer.put "#{dir}/build.yml", build_config.to_yaml.to_s
  end
  
  puts "Created Layout: #{args[:name]} in #{dir}" unless OPTIONS[:quiet]
  
end
