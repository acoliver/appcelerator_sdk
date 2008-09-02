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

class JavaSpring < Appcelerator::Plugin
  def before_add_plugin(event)
    if event[:name] == 'java:spring'
      event[:tx].rm Dir.glob("#{event[:project_dir]}/lib/spring-*.jar")
      if File.exists? "#{event[:project_dir]}/config/spring.xml"
        Appcelerator::PluginUtil.merge_spring("#{event[:project_dir]}/config/spring.xml","#{event[:plugin_dir]}/templates/spring.xml",event[:tx],event)
      else
        Appcelerator::Installer.copy event[:tx],"#{event[:plugin_dir]}/templates/spring.xml","#{event[:project_dir]}/config/spring.xml"
      end
      Appcelerator::Installer.copy event[:tx],"#{event[:plugin_dir]}/spring_license.txt", "#{event[:to_dir]}/spring_license.txt"
      Appcelerator::Installer.copy event[:tx],"#{event[:plugin_dir]}/spring_notice.txt", "#{event[:to_dir]}/spring_notice.txt"
      Appcelerator::PluginUtil.install_java(event)
    end
  end
end
