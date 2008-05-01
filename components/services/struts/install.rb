# This file is part of Appcelerator.
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
include Appcelerator
module Appcelerator
  class Struts

    #
    # this method is called when a project:update command is run on an existing
    # project.  NOTE: from_version and to_version *might* be the same in the case
    # we're forcing and re-install.  they could be different if moving from one
    # version to the next
    #
    def update_project(from_path,to_path,config,tx,from_version,to_version)
      puts "Updating java from #{from_version} to #{to_version}" if OPTIONS[:verbose]
      install(from_path,to_path,config,tx,true)

      classpath = IO.readlines("#{to_path}/.classpath")
      classpath.each do |line|
        line.gsub!(/appcelerator-([0-9\.])*\.jar/,"appcelerator-#{to_version}.jar")
        line.gsub!(/appcelerator-struts-([0-9\.])*\.jar/,"appcelerator-struts-#{to_version}.jar")
      end
      tx.put "#{to_path}/.classpath",classpath.join("")

    end

    # 
    # this method is called when a create:project command is run.  NOTE: this
    # command *might* be called instead of update_project in the case the user
    # ran --force-update on an existing project using create:project
    #
    def create_project(from_path,to_path,config,tx)
      install(from_path,to_path,config,tx,false)
    end
    
    def get_property(propertyfile,property)
      begin
        props = Properties.new
        f = File.new propertyfile
        props.load f
        props.each do |name, value|
          if name == property
            return value
          end
        end
      rescue
      end
    end
    
    def save_property(name,value,propertyfile)
      begin
        file = File.new propertyfile
        props = Properties.new(file)
        props.store(name,value)
        props.save(propertyfile)
      rescue
      end
    end
    
    private
    def install(from_path,to_path,config,tx,update)

      # remove old jars for upgrades
      if (File.exists?("#{to_path}/public/WEB-INF/lib"))
          Installer.remove_prev_jar(tx,"appcelerator","#{to_path}/public/WEB-INF/lib")
          Installer.remove_prev_jar(tx,"appcelerator-struts","#{to_path}/public/WEB-INF/lib")
      end

      Installer.copy(tx, "#{from_path}/dist", to_path)

      #tx.mkdir "#{to_path}/app/services/org/appcelerator/test"
      #Installer.copy(tx,"#{from_path}/build-appcelerator.xml", "#{to_path}/build-appcelerator.xml")
      #tx.rm "#{to_path}/app/services/EchoService.java" if File.exists? "#{to_path}/app/services/EchoService.java"
      #Installer.copy(tx,"#{from_path}/app/services/org/appcelerator/test/EchoService.java", "#{to_path}/app/services/org/appcelerator/test/EchoService.java")
      #Installer.copy(tx,"#{from_path}/appcelerator.xml", "#{to_path}/public/appcelerator.xml")
      #if update==false or update.nil?
      #  Installer.copy(tx,"#{from_path}/build-override.xml", "#{to_path}/build-override.xml")
      #end
      #
      ## re-write the application name to be the name of the directory
      #name = get_property "#{to_path}/config/build.properties","app.name"
      #if name.nil?
      #  name = File.basename(to_path)
      #end
      #temp1 = Installer.tempfile
      #FileUtils.cp "#{from_path}/build.properties",temp1.path
      ## save_property('service_version',config[:service_version],temp1.path)

      #temp2 = Installer.tempfile
      #FileUtils.cp "#{from_path}/build.xml",temp2.path
      #
      #replace_app_name name,temp1.path
      #replace_app_name name,temp2.path

      #Installer.copy tx, temp1.path, "#{to_path}/config/build.properties"
      #Installer.copy tx, temp2.path, "#{to_path}/build.xml"
      #
      #temp1.close
      #temp2.close

      #tx.mkdir "#{to_path}/src/java"
      #tx.mkdir "#{to_path}/src/war"
      #
      #template_dir = File.join(File.dirname(__FILE__),'templates')
      #tx.mkdir "#{to_path}/src/war/WEB-INF"
      #if update==false
      #  Installer.copy(tx,"#{template_dir}/web.xml","#{to_path}/config/web.xml")
      #else
      #  Appcelerator::PluginUtil.merge_webxml("#{to_path}/config/web.xml","#{from_path}/templates/web.xml",tx,nil,to_path)
      #end
      #if not update or not File.exists? "#{to_path}/.classpath"
      #  #
      #  # create an Eclipse .project/.classpath file      
      #  #
      #  classpath=[]
      #  classpath<<"<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
      #  classpath<<"<classpath>"
      #  classpath<<"<classpathentry kind=\"src\" path=\"src/java\"/>"
      #  classpath<<"<classpathentry kind=\"src\" path=\"app/services\"/>"
      #  classpath<<"<classpathentry kind=\"src\" path=\"public\"/>"
      #  classpath<<"<classpathentry kind=\"con\" path=\"org.eclipse.jdt.launching.JRE_CONTAINER\"/>"
      #  classpath<<"<classpathentry kind=\"output\" path=\"output/classes\"/>"
      #
      #  Dir["#{from_path}/lib/**/*"].each do |dir|
      #    dir = dir.gsub("#{from_path}",'')
      #    if dir =~ /^\//
      #      dir = dir[1..-1]
      #    end
      #    dir = "lib/appcelerator-#{config[:service_version]}.jar" if dir=="lib/appcelerator.jar"
      #    classpath << "<classpathentry kind=\"lib\" path=\"#{dir}\" />" if File.extname(dir)=='.jar'
      #  end
      #
      #  classpath<<"</classpath>"
      #
      #  tx.put "#{to_path}/.classpath",classpath.join("\n")
      #end
      #
      #if not update or (update and not File.exists? "#{to_path}/.project")

      #  project=<<STR
#<projectDescription>
#   <name>#{name}</name>
#   <comment>Appcelerator Java Project</comment>
#   <projects>
#   </projects>
#   <buildSpec>
#      <buildCommand>
#         <name>org.eclipse.jdt.core.javabuilder</name>
#         <arguments>
#         </arguments>
#      </buildCommand>
#   </buildSpec>
#   <natures>
#      <nature>org.eclipse.jdt.core.javanature</nature>
#      <nature>org.appcelerator.ide.appceleratorNature</nature>      
#   </natures>
#</projectDescription>
#STR
     
      #  project = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + project
      #  tx.put "#{to_path}/.project",project
      #end
    
      #%w(templates script log).each do |name|
      #  tx.rm "#{to_path}/#{name}" if File.exists? "#{to_path}/#{name}"
      #end

      #Dir["#{from_path}/plugins/*.rb"].each do |fpath|
      #  fname = File.basename(fpath)
      #  Installer.copy tx, fpath,"#{to_path}/plugins/#{fname}"
      #end
      #true
    end
    def replace_jar_eclipse(to_version,to_path, tx)
      classpath = IO.readlines("#{to_path}/.classpath")
      classpath.each do |line|
        line.gsub!(/appcelerator-([0-9\.])*\.jar/,"appcelerator-#{to_version}.jar")
      end
      tx.put "#{to_path}/.classpath",classpath.join("")
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
class Properties < Hash
    def initialize(filename=nil)
      if !filename.nil?
        load filename
      end
    end
    def load(properties_string)
        properties_string.each_line do |line|
            line.strip!
            if line[0] != ?# and line[0] != ?=
                i = line.index('=')

                if i
                    store(line[0..i - 1].strip, line[i + 1..-1].strip)
                # else
                #     store(line, '')
                end
            end
        end
     end

     def save(filename)
       file = File.new(filename,"w+")
       each_pair {|key,value| file.puts "#{key}=#{value}\n" }
    end
end


