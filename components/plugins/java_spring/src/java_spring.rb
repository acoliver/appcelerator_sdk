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
