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
CommandRegistry.registerCommand('install:service','install an SOA integration point',[
  {
    :name=>'location',
    :help=>'path or URL to plugin file or name of a service integration from the network',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],[
  {
     :name=>:version,
     :display=>'--version=X.X.X',
     :help=>'version of the service to install',
     :value=>true
  }
],[
  'install:service java',
  'install:service service_java_1.0.zip',
  'install:service http://myurl/service_java.zip',
  'install:service java,ruby'
]) do |args,options|

  stuff = args[:location].split(',').uniq
  stuff.each do |service|
    Installer.require_component(:service, service.strip, options[:version])
  end

end
