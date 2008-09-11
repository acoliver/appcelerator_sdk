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

  if Project.is_project_dir?()
    project = Project.load()
    out_dir = project.get_path(:web)
  else
    out_dir = Dir.pwd
  end

  out_file = File.join(out_dir, "#{name}.html")

  with_io_transaction(Dir.pwd) do |tx|
    event = {:file=>out_file, :name=>name}

    PluginManager.dispatchEvents('create_html', event) do
        template = File.read "#{File.dirname(__FILE__)}/templates/template.html"
        tx.put out_file, template
    end

    puts "Created HTML file => #{out_file}" unless OPTIONS[:quiet]
  end

end
