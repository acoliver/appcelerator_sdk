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
CommandRegistry.registerCommand('install:theme','install a theme',[
  {
    :name=>'location',
    :help=>'path or URL to theme file or name of the theme in the network. If the theme is a name of theme, must be in the format control:theme',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],[
  {
    :name=>'version',
    :display=>'--version=X.X.X',
    :help=>'version of the theme to add',
    :value=>true
  }
],[
  'install:theme input:my_theme',
  'install:theme select:my_theme1,panel:my_theme2',
  'install:theme my_theme.zip,your_theme.zip',
  'install:theme http://myurl.com/foo_theme.zip'
]) do |args,options|

  theme_names = args[:location].split(',').uniq
  theme_names.each do |theme|
    Installer.require_component(:theme, theme.strip, options[:version])
  end
end
