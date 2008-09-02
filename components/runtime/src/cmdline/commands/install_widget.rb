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
CommandRegistry.registerCommand('install:widget','install a widget',[
  {
    :name=>'location',
    :help=>'path or URL to widget file or name of the widget in the network',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],[
  {
    :name=>'version',
    :display=>'--version=X.X.X',
    :help=>'version of the widget to add',
    :value=>true
  }
],[
  'install:widget app:iterator',
  'install:widget app:iterator,app:template,app:box',
  'install:widget my_widget.zip,your_widget.zip',
  'install:widget http://myurl.com/foo_widget.zip'
]) do |args,options|

  widget_names = args[:location].split(',').uniq
  widget_names.each do |widget|
    Installer.require_component(:widget, widget.strip, options[:version])
  end
end
