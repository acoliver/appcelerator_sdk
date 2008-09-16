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
module Appcelerator
  class Java < Project

    @@paths.merge!({
      :src => ["src", "Java source code for this project"],
      :stage => ["stage", "Stage directory"],
      :config => ["config", "Java/Appcelerator configuration files, including web.xml"],
      :lib => ["lib", "Contains all necessary jars"]
    })

    #
    # this method is called when a project:update command is run on an existing
    # project.  NOTE: from_version and to_version *might* be the same in the case
    # we're forcing and re-install.  they could be different if moving from one
    # version to the next
    #
    def update_project(from_version, to_version, tx)
      puts "Updating java from #{from_version} to #{to_version}" if OPTIONS[:verbose]
      install(tx, true)
      replace_jar_eclipse(to_version,@path,tx)
      true
    end

    # 
    # this method is called when a create:project command is run.  NOTE: this
    # command *might* be called instead of update_project in the case the user
    # ran --force-update on an existing project using create:project
    #
    def create_project(tx)
      install(tx, false)
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
    def install(tx, update)

      from_path = @service_dir
      lib_dir = get_path(:lib)
      services_dir = get_path(:services)
      config_dir = get_path(:config)
      src_dir = get_path(:src)

      remove_prev_jar(tx,"appcelerator", lib_dir)
      Installer.copy(tx,"#{from_path}/lib/appcelerator.jar", "#{lib_dir}/appcelerator-#{service_version()}.jar")

      files_to_skip = [
         "#{__FILE__}",'war.rb','install.rb',
        'build.yml','appcelerator.xml','build.xml',
        'build.properties','lib\/appcelerator.jar',
        'build-override.xml','app/services/org/appcelerator/test/EchoService.java']
      Installer.copy(tx, from_path, @path, files_to_skip)

      tx.mkdir "#{services_dir}/org/appcelerator/test"

      tx.rm "#{services_dir}/EchoService.java" if File.exists? "#{services_dir}/EchoService.java"
      Installer.copy(tx,"#{from_path}/app/services/org/appcelerator/test/EchoService.java",
                        "#{services_dir}/org/appcelerator/test/EchoService.java")

      Installer.copy(tx,"#{from_path}/build-appcelerator.xml", "#{@path}/build-appcelerator.xml")
      if update==false or update.nil?
        Installer.copy(tx,"#{from_path}/build-override.xml", "#{@path}/build-override.xml")
      end

      Installer.copy(tx,"#{from_path}/appcelerator.xml", get_web_path("appcelerator.xml"))

      # re-write the application name to be the name of the directory
      name = get_property("#{config_dir}/build.properties","app.name")
      name = config[:name] if name.nil?

      build_properties = "#{config_dir}/build.properties"
      FileUtils.cp("#{from_path}/build.properties", build_properties)
      save_property("app.name", name, build_properties)
      save_property("stage.dir", @config[:stage], build_properties)
      save_property("src.dir", @config[:src], build_properties)
      save_property("lib.dir", @config[:lib], build_properties)
      save_property("web.dir", @config[:web], build_properties)
      save_property("config.dir", @config[:config], build_properties)

      temp2 = Installer.tempfile
      FileUtils.cp "#{from_path}/build.xml",temp2.path
      replace_app_name(name, temp2.path)
      Installer.copy tx, temp2.path, "#{@path}/build.xml"
      temp2.close


      tx.mkdir "#{src_dir}/java"
      tx.mkdir "#{src_dir}/war"
      
      template_dir = File.join(File.dirname(__FILE__),'templates')
      tx.mkdir "#{src_dir}/war/WEB-INF"
      if update==false
        Installer.copy(tx,"#{template_dir}/web.xml","#{config_dir}/web.xml")
      else
        merge_webxml("#{config_dir}/web.xml","#{from_path}/templates/web.xml",tx)
      end
      if not update or not File.exists? "#{@path}/.classpath"
        #
        # create an Eclipse .project/.classpath file      
        #
        classpath=[]
        classpath<<"<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
        classpath<<"<classpath>"
        classpath<<"<classpathentry kind=\"src\" path=\"src/java\"/>"
        classpath<<"<classpathentry kind=\"src\" path=\"app/services\"/>"
        classpath<<"<classpathentry kind=\"con\" path=\"org.eclipse.jdt.launching.JRE_CONTAINER\"/>"
        classpath<<"<classpathentry kind=\"output\" path=\"output/classes\"/>"
      
        Dir["#{from_path}/lib/**/*"].each do |dir|
          dir = dir.gsub("#{from_path}/lib", lib_dir)
          if dir =~ /^\//
            dir = dir[1..-1]
          end
          dir = "#{lib_dir}/appcelerator-#{service_version()}.jar" if dir=="#{lib_dir}/appcelerator.jar"
          classpath << "<classpathentry kind=\"lib\" path=\"#{dir}\" />" if File.extname(dir)=='.jar'
        end
      
        classpath<<"</classpath>"
      
        tx.put "#{@path}/.classpath",classpath.join("\n")
      end
      
      if not update or (update and not File.exists? "#{@path}/.project")

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
      <nature>org.appcelerator.ide.appceleratorNature</nature>      
   </natures>
</projectDescription>
STR
     
        project = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + project
        tx.put "#{@path}/.project",project
      end
    
      %w(templates script log).each do |name|
        tx.rm "#{@path}/#{name}" if File.exists? "#{@path}/#{name}"
      end

      Dir["#{from_path}/plugins/*.rb"].each do |fpath|
        fname = File.basename(fpath)
        Installer.copy tx, fpath, get_plugin_path(fname)
      end

      true
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

  def merge_webxml(to, from, tx)
    error = false
    filename = "web.xml"
    require "rexml/document"
  
    tofile = File.read to
    todoc = REXML::Document.new(tofile)
  
    fromfile = File.read from
    fromdoc = REXML::Document.new(fromfile)
  
    fromdoc.root.elements.each("/web-app//context-param") do |fromcontextparam|
      paramname = get_subelementtext(fromcontextparam,"param-name")
      tocontextparam = ensure_element_namedsubelment(todoc.root,"context-param","param-name",paramname,["param-value"])
      tocontextparam.get_elements("param-value")[0].text = fromcontextparam.get_elements("param-value")[0].text
      # puts "merged: #{tocontextparam}"
    end
    fromdoc.root.elements.each("/web-app//listener") do |listener|
      listenerclass = get_subelementtext(listener,"listener-class")
      tolistener = ensure_element_subelment(todoc.root,"listener","listener-class",listenerclass)
      tolistener.get_elements("listener-class")[0].text = listener.get_elements("listener-class")[0].text
      # puts "merged: #{tolistener}"
    end
    fromdoc.root.elements.each("/web-app//servlet") do |fromservlet|
      servletname = get_subelementtext(fromservlet,"servlet-name")
      toservlet = ensure_element_namedsubelment(todoc.root,"servlet","servlet-name",servletname,["servlet-class","load-on-startup"])
      toservlet.get_elements("servlet-class")[0].text = fromservlet.get_elements("servlet-class")[0].text
      toservlet.get_elements("load-on-startup")[0].text = fromservlet.get_elements("load-on-startup")[0].text
      fromservlet.elements.each("//init-param") do |frominitparam|
        paramname = get_subelementtext(frominitparam,"param-name")
        if !paramname.nil? && paramname!=""
          # puts "adding init param #{paramname} for servlet #{servletname}"
          toinitparam = ensure_element_namedsubelment(toservlet,"init-param","param-name",paramname,["param-value"])
          toinitparam.get_elements("param-value")[0].text = frominitparam.get_elements("param-value")[0].text
        end
      end
      # puts "merged: #{toservlet}"
    end
    fromdoc.root.elements.each("/web-app//servlet-mapping") do |fromservletmapping|
      servletname = get_subelementtext(fromservletmapping,"servlet-name")
      toservletmapping = ensure_element_namedsubelment(todoc.root,"servlet-mapping","servlet-name",servletname,["url-pattern"])
      toservletmapping.get_elements("url-pattern")[0].text = fromservletmapping.get_elements("url-pattern")[0].text
      # puts "merged: #{toservletmapping}"
    end
    if not error
      puts "writing file"
      tmpoutfile = Installer.tempfile
      todoc.write(tmpoutfile,-1)
      tmpoutfile.flush
      tmpoutfile.close
      Appcelerator::Installer.copy tx,tmpoutfile.path,to
    end
  end
  
  def ensure_element_subelment(parentelement,name,sub_name,value)
    parentelement.each_element("//" +name) do |element|
      subelement = element.get_elements(sub_name)
      if !subelement.nil? && !subelement.empty?
        curvalue = subelement[0].get_text
        # puts "comparing #{curvalue} to #{value}"
        if curvalue == value
          # puts "found for #{value}: #{subelement}"
          return element
        end
      end
    end
    newelement = parentelement.add_element(name)
    newelement.add_element(sub_name)
    # puts "new: #{newelement}"
    return newelement
  end

  def ensure_simple_element(element,name)
    element.each_element(name) do |element|
      return element
    end
    return element.add_element(name)
  end

  def get_subelementtext(element,subtag)
    subelement = element.get_elements(subtag)[0]
    subelement.get_text
  end
  
  def ensure_element_namedsubelment(parentelement,name,sub_name,value,sub_values)
    parentelement.each_element("//" +name) do |element|
      subelement = element.get_elements(sub_name)
      if !subelement.nil? && !subelement.empty?
        curvalue = subelement[0].get_text
        # puts "comparing #{curvalue} to #{value}"
        if curvalue == value
          # puts "found for #{value}: #{subelement}"
          return element
        end
      end
    end
    newelement = parentelement.add_element(name)
    newelement.add_element(sub_name).text=value
    sub_values.each do |sub_value|
      newelement.add_element(sub_value)
    end
    # puts "new: #{newelement}"
    return newelement
  end

  def remove_prev_jar(tx,name,dir)
    exists = File.exists? dir
    if exists
      Dir.foreach("#{dir}") do |file|
        puts "checking #{name}-([0-9]\.)*.jar against '#{file}'" if OPTIONS[:verbose]
        if file =~ Regexp.new("#{name}-[0-9]+.*.jar") or file == "#{name}.jar"
          puts "removing " + File.expand_path(file, dir) if OPTIONS[:verbose]
          tx.rm File.expand_path(file, dir)
        end
      end
    else
      FileUtils.mkdir dir
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


