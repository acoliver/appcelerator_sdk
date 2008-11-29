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
CommandRegistry.registerCommand('create:plugin','create a new plugin project',[
  {
    :name=>'path',
    :help=>'path to directory where plugin project should be created',
    :required=>true,
    :default=>nil,
    :type=>[
      Types::FileType,
      Types::DirectoryType,
      Types::AlphanumericType
    ],
    :conversion=>Types::DirectoryType
  },
  {
    :name=>'name',
    :help=>'name of the plugin to create (such as foo:bar)',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],nil,[
  'create:plugin ~/tmp foo:bar',
  'create:plugin C:\mytemp hello:world',
  'create:plugin . test:plugin'
]) do |args,options|
  
  class_name = args[:name].gsub(/\/(.?)/) { "::" + $1.upcase }.gsub(/(^|_|:)(.)/) { $2.upcase }
  plugin_name = args[:name].gsub ':', '_'

  dir = args[:path]
  if Project.is_project_dir?(dir)
    project = Project.load(dir)
    dir = project.get_path(:plugins)
  else
    project = nil
  end 
  dir = File.join(dir, plugin_name)
  
  event = {:dir=>dir,:name=>args[:name],:project=>project}
  PluginManager.dispatchEvents('create_plugin',event) do
    
    FileUtils.mkdir_p(dir) unless File.exists?(dir)
    
    template_dir = "#{File.dirname(__FILE__)}/templates"
    
    template = File.read "#{template_dir}/plugin.rb"
    template.gsub! 'ExamplePlugin', class_name
    
    src_dir = "#{dir}/src"
    FileUtils.mkdir_p(src_dir) unless File.exists?(src_dir)
    
    FileUtils.cp "#{template_dir}/LICENSING.readme", "#{dir}/LICENSING.readme"
    Installer.put "#{src_dir}/#{plugin_name}.rb", template
    
    template = File.read "#{template_dir}/plugin_Rakefile"
    template.gsub! 'PLUGIN', plugin_name
    
    build_config = {
      :name=>args[:name],
      :version=>1.0,
      :type=>'plugin',
      :description=>"#{args[:name]} plugin",
      :release_notes=>"initial release",
      :tags=> [],
      :licenses=>[]
    }
    
    Installer.put "#{dir}/Rakefile", template
    Installer.put "#{dir}/build.yml", build_config.to_yaml.to_s
  end
  
  puts "Created Plugin: #{args[:name]} in #{dir}" unless OPTIONS[:quiet]
end
