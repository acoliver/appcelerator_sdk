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
  
  if not name =~ /^app:/
    die "Widgets must begin with app:"
  end
  
  if not name =~ /^app:[\w\d]+[_][\w\d_]+$/
    STDERR.puts
    STDERR.puts "ERROR: Invalid widget name"
    STDERR.puts
    STDERR.puts "User-defined widgets must start with app: and must contain at "
    STDERR.puts "least one underscore symbol separated by an alphanumeric word/letter"
    STDERR.puts
    STDERR.puts "  > app:my_widget"
    STDERR.puts "  > app:my_widget_2"
    STDERR.puts "  > app:a_really_cool_widget"
    STDERR.puts
    exit 1
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
  
    build_config = {:name=>name,:version=>1.0,:type=>'widget',:description=>"#{args[:name]} widget",:release_notes=>"initial release",:licenses=>[]}
    build_config[:dependencies] = [{:type=>'websdk',:version=>'>=2.1',:name=>'websdk'}]
    build_config[:tags] = []

    Installer.put "#{dir}/Rakefile", template
    Installer.put "#{dir}/build.yml", build_config.to_yaml.to_s
  
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
