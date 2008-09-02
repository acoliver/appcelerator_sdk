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
CommandRegistry.registerCommand('create:html','create a new html file',[
  {
    :name=>'name',
    :help=>'name of the HTML file',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],nil,[
  'create:html test.html',
  'create:html test'
]) do |args,options|

  name = args[:name].gsub('.html','')
  
  # this is used to make sure we're in a project directory
  lang = Project.get_service

  with_io_transaction(Dir.pwd) do |tx|
    event = {:file=>"#{Dir.pwd}/public/#{name}.html", :service=>lang, :project_dir=> Dir.pwd}
    PluginManager.dispatchEvent 'before_create_html',event
    template = File.read "#{File.dirname(__FILE__)}/templates/template.html"
    tx.put "#{Dir.pwd}/public/#{name}.html", template
    PluginManager.dispatchEvent 'after_create_html',event
    puts "Created HTML file => #{Dir.pwd}/public/#{name}.html" unless OPTIONS[:quiet]
  end

end
