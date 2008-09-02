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
CommandRegistry.registerCommand('install:layout','install a layout',[
  {
    :name=>'location',
    :help=>'path or URL to layout file or name of the layout in the network',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],[
  {
    :name=>'version',
    :display=>'--version=X.X.X',
    :help=>'version of the layout to add',
    :value=>true
  }
],[
  'install:layout my_layout',
  'install:layout my_layout1,my_layout2',
  'install:layout my_layout.zip,your_layout.zip',
  'install:layout http://myurl.com/foo_layout.zip'
]) do |args,options|

  layout_names = args[:location].split(',').uniq
  layout_names.each do |layout|
    Installer.require_component(:layout, layout.strip, options[:version])
  end
end
