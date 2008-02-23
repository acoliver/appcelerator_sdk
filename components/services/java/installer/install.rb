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

module Appcelerator
  class Java
    def create_project(from_path,to_path,config,tx)
      Appcelerator::Installer.copy(tx,from_path,to_path,["#{__FILE__}",'war.rb','install.rb','build.yml','appcelerator.xml','build.xml','build.properties'])

      # re-write the application name to be the name of the directory
      name = File.basename(to_path)

      temp1 = Installer.tempfile
      FileUtils.cp "#{from_path}/build.properties",temp1.path
      temp2 = Installer.tempfile
      FileUtils.cp "#{from_path}/build.xml",temp2.path
      
      replace_app_name name,temp1.path
      replace_app_name name,temp2.path

      Installer.copy tx, temp1.path, "#{to_path}/config/build.properties"
      Installer.copy tx, temp2.path, "#{to_path}/build.xml"
      Installer.copy tx, "#{from_path}/appcelerator.xml", "#{to_path}/public"

      tx.mkdir "#{to_path}/src/java"
      tx.mkdir "#{to_path}/src/war"
      
      template_dir = File.join(File.dirname(__FILE__),'templates')
      tx.mkdir "#{to_path}/src/war/WEB-INF"
      Installer.copy tx, "#{template_dir}/web.xml","#{to_path}/config"
      
      #
      # create an Eclipse .project/.classpath file      
      #
      classpath=[]
      classpath<<"<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
      classpath<<"<classpath>"
      classpath<<"<classpathentry kind=\"src\" path=\"src/java\"/>"
      classpath<<"<classpathentry kind=\"src\" path=\"app/services\"/>"
      classpath<<"<classpathentry kind=\"src\" path=\"public\"/>"
      classpath<<"<classpathentry kind=\"con\" path=\"org.eclipse.jdt.launching.JRE_CONTAINER\"/>"
      classpath<<"<classpathentry kind=\"output\" path=\"output/classes\"/>"
      
      Dir["#{to_path}/lib/**/*"].each do |dir|
        classpath << "<classpathentry kind=\"lib\" path=\"#{dir}\" />" if File.extname(dir)=='.jar'
      end
      
      classpath<<"</classpath>"
      
      tx.put "#{to_path}/.classpath",classpath.join("\n")
      
      ###FIXME add appcelerator nature
      
      project=<<STR
<projectDescription>
   <name>#{name}</name>
   <comment>Appcelerator Java Project</comment>
   <projects>
   </projects>
   <buildSpec>
      <buildCommand>
         <name>org.eclipse.jdt.core.javabuilder</name>
         <arguments>
         </arguments>
      </buildCommand>
   </buildSpec>
   <natures>
      <nature>org.eclipse.jdt.core.javanature</nature>
   </natures>
</projectDescription>
STR
     
      project = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + project
      tx.put "#{to_path}/.project",project
      Installer.copy tx, "#{from_path}/war.rb","#{to_path}/plugins/war.rb"
      
      true
    end
    
    def replace_app_name(name,file)
      content = File.read file
      f = File.open file,'w+'
      content.gsub!('myapp',name)
      f.puts content
      f.flush
      f.close
      true
    end
  end
end


