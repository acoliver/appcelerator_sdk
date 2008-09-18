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
      :src => ["src", "Java source code"],
      :stage => ["stage", "staging"],
      :lib => ["lib", "necessary jars"]
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
      config_dir = get_path(:config)

      files_to_skip = [
        "#{__FILE__}", 'war.rb','install.rb',
        'build.yml','appcelerator.xml','build.xml',
        'build.properties','lib\/appcelerator.jar',
        'build-override.xml','app/services/org/appcelerator/test/EchoService.java']

      if update != false and not(update.nil?)
        excludes = ['build-override.xml', 'web.xml']
      else
        excludes = []
      end

      remove_prev_jar(tx,"appcelerator", get_path(:lib))

      Installer.copy(tx, "#{from_path}/pieces/root", @path, excludes)
      Installer.copy(tx, "#{from_path}/pieces/lib", get_path(:lib))
      Installer.copy(tx, "#{from_path}/pieces/config", get_path(:config))
      Installer.copy(tx, "#{from_path}/pieces/plugins", get_path(:plugins))
      Installer.copy(tx, "#{from_path}/pieces/src", get_path(:src))
      Installer.copy(tx, "#{from_path}/pieces/public", get_path(:web))
      Installer.copy(tx, "#{from_path}/pieces/services", get_path(:services))

      tx.after_tx { 
        build_properties = "#{config_dir}/build.properties"
        save_property("app.name", @config[:name], build_properties)
        save_property("stage.dir", @config[:stage], build_properties)
        save_property("src.dir", @config[:src], build_properties)
        save_property("lib.dir", @config[:lib], build_properties)
        save_property("web.dir", @config[:web], build_properties)
        save_property("config.dir", @config[:config], build_properties)

        replace_app_name(@config[:name], "#{@path}/build.xml")

        if update != false and not(update.nil?)
          merge_webxml("#{config_dir}/web.xml","#{from_path}/pieces/config/web.xml")
        end

        update_classpath_file("#{@path}/.classpath", update)
        update_eclipse_project_file("#{@path}/.project", update)
      }

      true
    end

    def update_eclipse_project_file(filepath, update)
      if not update or not(File.exists?(filepath))
        project=<<STR
<projectDescription>
   <name>#{@config[:name]}</name>
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

        File.open(filepath, 'w') do |f|  
          f.puts project
        end
      end


    end
    def update_classpath_file(filepath, update)
      if not update or not File.exists? filepath

        # create an Eclipse .project/.classpath file
        classpath=[]
        classpath<<"<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
        classpath<<"<classpath>"
        classpath<<"<classpathentry kind=\"src\" path=\"src/java\"/>"
        classpath<<"<classpathentry kind=\"src\" path=\"app/services\"/>"
        classpath<<"<classpathentry kind=\"con\" path=\"org.eclipse.jdt.launching.JRE_CONTAINER\"/>"
        classpath<<"<classpathentry kind=\"output\" path=\"output/classes\"/>"
      
        from_path = @service_dir
        Dir["#{from_path}/pieces/lib/**/*"].each do |dir|
          dir = dir.gsub("#{from_path}/pieces/lib", get_path(:lib))
          if dir =~ /^\//
            dir = dir[1..-1]
          end
          dir = "#{get_path(:lib)}/appcelerator-#{service_version()}.jar" if dir=="#{get_path(:lib)}/appcelerator.jar"
          classpath << "<classpathentry kind=\"lib\" path=\"#{dir}\" />" if File.extname(dir)=='.jar'
        end
      
        classpath<<"</classpath>"

        File.open(filepath, 'w') do |f|  
           f.puts classpath.join("\n")
        end

      end
    end

    def replace_jar_eclipse(to_version,to_path)
      classpath = IO.readlines("#{to_path}/.classpath")
      classpath.each do |line|
        line.gsub!(/appcelerator-([0-9\.])*\.jar/,"appcelerator-#{to_version}.jar")
      end

      File.open("#{to_path}/.classpath", 'w') do |f|  
         f.puts classpath.join("\n")
      end
    end

    def replace_app_name(name, file)
      content = File.read file
      f = File.open file,'w+'
      content.gsub!('myapp',name)
      f.puts content
      f.flush
      f.close
      true
    end
  end

  def merge_webxml(to, from)
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
      FileUtils.cp(tmpoutfile.path, to)
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


