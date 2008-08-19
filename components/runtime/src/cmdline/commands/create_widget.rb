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
CommandRegistry.registerCommand('create:widget','create a new widget project',[
  {
    :name=>'path',
    :help=>'path to directory where widget should be created',
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
    :help=>'name of the widget to create (such as app:my_widget)',
    :required=>true,
    :type=>Types::StringType
  }
],nil,[
  'create:widget c:\tmp app:my_widget',
  'create:widget ~/mydir app:my_widget,app:widget_blah'
]) do |args,options|
  
  name = args[:name]
  
  if not name =~ /^app:[\w\d]+[_][\w\d_]+$/
    message = <<-ERROR_MESSAGE
Invalid widget name

User-defined widgets must start with app: and must contain at
least one underscore symbol separated by an alphanumeric word/letter

  > app:my_widget
  > app:my_widget_2
  > app:a_really_cool_widget
ERROR_MESSAGE
    raise UserError.new(message)
  end
  
  class_name = name.gsub(/\/(.?)/) { "::" + $1.upcase }.gsub(/(^|_|:)(.)/) { $2.upcase }
  widget_name = name.gsub ':', '_'
  
  dir = File.join(args[:path].path,widget_name)
  event = {:widget_dir=>dir,:name=>name}
  PluginManager.dispatchEvents('create_widget',event) do
    
    FileUtils.mkdir_p(dir) unless File.exists?(dir)
    
    template_dir = "#{File.dirname(__FILE__)}/templates"
    
    template = File.read "#{template_dir}/widget.js"
    template.gsub! 'WIDGET_CLASS_NAME', class_name
    template.gsub! 'NAME', name
    
    src_dir = "#{dir}/src"
    FileUtils.mkdir_p(src_dir) unless File.exists?(src_dir)
    
    Installer.put "#{src_dir}/#{widget_name}.js", template
    
    template = File.read "#{template_dir}/widget_Rakefile"
    template.gsub! 'WIDGET', widget_name
    
    build_yaml = {
      :name=>name,
      :version=>1.0,
      :type=>'widget',
      :description=>"#{args[:name]} widget",
      :release_notes=>"initial release",
      :licenses=>[],
      :dependencies => [{:type=>'websdk',:version=>'>=2.1',:name=>'websdk'}],
      :tags => []
    }.to_yaml
    
    build_yaml.gsub!(/(\n\s*:tags:)/,
    "\n# Tags should be a comma-separated list of identifiers, like: [happy, tasty, ajaxy]\\1")
    
    Installer.put "#{dir}/Rakefile", template
    Installer.put "#{dir}/build.yml", build_yaml
  
    %w(css images doc js).each do |d|
      FileUtils.mkdir_p "#{src_dir}/#{d}" unless File.exists? "#{src_dir}/#{d}"
    end
  
    FileUtils.cp "#{template_dir}/LICENSING.readme", "#{dir}/LICENSING.readme"
  
    widget_example = File.read "#{template_dir}/widget_doc_example.md"
    widget_example.gsub! 'NAME', name
  
    Installer.put "#{src_dir}/doc/example1.md", widget_example
  
    #TODO: add compression and symbol stuff here to rake file and path
  end
  
  puts "Created Widget: #{name} in #{dir}" unless OPTIONS[:quiet]
end
