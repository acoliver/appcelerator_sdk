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

Appcelerator::CommandRegistry.registerCommand('create:widget','create a new widget project',[
  {
    :name=>'path',
    :help=>'path to directory where project should be created',
    :required=>true,
    :default=>nil,
    :type=>[
      Appcelerator::Types::FileType,
      Appcelerator::Types::DirectoryType,
      Appcelerator::Types::AlphanumericType
    ],
    :conversion=>Appcelerator::Types::DirectoryType
  },
  {
    :name=>'name',
    :help=>'name of the widget to create (such as app:my_widget)',
    :required=>true,
    :default=>nil,
    :type=>Appcelerator::Types::StringType
  }
],nil,nil) do |args,options|
  
  class_name = args[:name].gsub(/\/(.?)/) { "::" + $1.upcase }.gsub(/(^|_|:)(.)/) { $2.upcase }
  widget_name = args[:name].gsub ':', '_'

  dir = File.join(args[:path].path,widget_name)
  Appcelerator::PluginManager.dispatchEvent 'before_create_widget',dir,args[:name]

  FileUtils.mkdir_p(dir) unless File.exists?(dir)
  
  template_dir = "#{File.dirname(__FILE__)}/templates"

  template = File.read "#{template_dir}/widget.js"
  template.gsub! 'WIDGET_CLASS_NAME', class_name
  template.gsub! 'NAME', args[:name]
  
  src_dir = "#{dir}/src"
  FileUtils.mkdir_p(src_dir) unless File.exists?(src_dir)
  
  Appcelerator::Installer.put "#{src_dir}/#{widget_name}.js", template
  
  template = File.read "#{template_dir}/widget_Rakefile"
  template.gsub! 'WIDGET', widget_name
  
  Appcelerator::Installer.put "#{dir}/Rakefile", template
  Appcelerator::Installer.put "#{dir}/build.yml", {:name=>widget_name,:version=>1.0,:type=>'widget'}.to_yaml.to_s
  
  %w(css images doc js).each do |d|
    FileUtils.mkdir_p "#{src_dir}/#{d}" unless File.exists? "#{src_dir}/#{d}"
  end
  
  widget_example = File.read "#{template_dir}/widget_doc_example.md"
  widget_example.gsub! 'NAME', args[:name]
  
  Appcelerator::Installer.put "#{src_dir}/doc/example1.md", widget_example
  
  #TODO: add compression and symbol stuff here to rake file and path
  
  Appcelerator::PluginManager.dispatchEvent 'after_create_widget',dir,args[:name]
  puts "Created Widget: #{args[:name]} in #{dir}" unless OPTIONS[:quiet]
end