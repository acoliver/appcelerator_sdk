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

Appcelerator::CommandRegistry.registerCommand('create:html','create a new html file',[
  {
    :name=>'name',
    :help=>'name of the HTML file',
    :required=>true,
    :default=>nil,
    :type=>Appcelerator::Types::StringType
  }
],nil,[
  'create:html test.html',
  'create:html test'
]) do |args,options|

  name = args[:name].gsub('.html','')
  
  # this is used to make sure we're in a project directory
  lang = Appcelerator::Project.get_service

  with_io_transaction(Dir.pwd) do |tx|
    event = {:file=>"#{Dir.pwd}/public/#{name}.html", :service=>lang, :project_dir=> Dir.pwd}
    Appcelerator::PluginManager.dispatchEvent 'before_create_html',event
    template = File.read "#{File.dirname(__FILE__)}/templates/template.html"
    tx.put "#{Dir.pwd}/public/#{name}.html", template
    Appcelerator::PluginManager.dispatchEvent 'after_create_html',event
    puts "Created HTML file => #{Dir.pwd}/public/#{name}.html" unless OPTIONS[:quiet]
  end

end
