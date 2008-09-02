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
