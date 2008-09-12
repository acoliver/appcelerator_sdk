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
        merge_spring("#{event[:project_dir]}/config/spring.xml","#{event[:plugin_dir]}/templates/spring.xml",event[:tx],event)
      else
        Appcelerator::Installer.copy event[:tx],"#{event[:plugin_dir]}/templates/spring.xml","#{event[:project_dir]}/config/spring.xml"
      end
      Appcelerator::Installer.copy event[:tx],"#{event[:plugin_dir]}/spring_license.txt", "#{event[:to_dir]}/spring_license.txt"
      Appcelerator::Installer.copy event[:tx],"#{event[:plugin_dir]}/spring_notice.txt", "#{event[:to_dir]}/spring_notice.txt"
      install_java(event)
    end
  end

  def install_java (event)
    if File.exist? "#{event[:plugin_dir]}/java"
      name = get_plugintype(event[:name])
      puts "building jar"
      jarfile = "#{event[:to_dir]}/appcelerator-plugin-#{name}.jar"
      clean_jar(jarfile)
      compile("#{event[:project_dir]}/lib","#{event[:plugin_dir]}/java","#{event[:to_dir]}/classes")
      jar(jarfile, "#{event[:to_dir]}/classes")
      clean_dir("#{event[:to_dir]}/classes")
      remove_prev_jar(event[:tx],"appcelerator-plugin-#{name}","#{event[:project_dir]}/lib")
      Appcelerator::Installer.copy(event[:tx],jarfile, "#{event[:project_dir]}/lib/appcelerator-plugin-#{name}-#{event[:version]}.jar")
      Plugin.replace_jar_eclipse(event[:version],event[:project_dir],event[:tx],name)
    end
    if File.exist? "#{event[:plugin_dir]}/spring.xml"
      puts "merging spring"
      merge_spring("#{event[:project_dir]}/config/spring.xml","#{event[:plugin_dir]}/spring.xml",event[:tx],event)
    end

    if File.exist? "#{event[:plugin_dir]}/web.xml"
      puts "merging web.xml"
      merge_webxml("#{event[:project_dir]}/config/web.xml","#{event[:plugin_dir]}/web.xml",event[:tx],event)
    end
    if File.exist? "#{event[:plugin_dir]}/web"
      puts "copying web source"
      Appcelerator::Installer.copy event[:tx],"#{event[:plugin_dir]}/web","#{event[:project_dir]}/public"
    end
    if File.exist? "#{event[:plugin_dir]}/lib"
      puts "copying lib"
      Appcelerator::Installer.copy event[:tx],"#{event[:plugin_dir]}/lib","#{event[:project_dir]}/lib"
    end
  end

  def clean_jar(file)
    if File.exists?(file)
      File.delete(file)
    end
  end

  def compile(libdir,java_source, java_classes)
      clean_dir(java_classes)
      FileUtils.mkdir_p java_classes
      src = Dir["#{java_source}/**/*.java"].inject([]) {|a,f| a<<wrapfilename(f)}
      FileUtils.mkdir_p "#{java_classes}" unless File.exists? "#{java_classes}"
      java_path_separator = separator
      FileUtils.cd("#{libdir}") do |dir|
        cp = Dir["**/*.jar"].inject([]) {|a,f| a<<wrapfilename(f)}
        system "javac -g -cp #{cp.join(java_path_separator)} #{src.join(' ')} -target 1.5 -d #{wrapfilename(java_classes)}"
      end
  end

  def jar(destfile, dir)
    FileUtils.cd(dir) do |dir|
      system "jar cf #{destfile} ."
    end
  end

  def clean_dir(dir)
    FileUtils.rm_r dir if File.exists?(dir)
  end
    

  def merge_webxml (to,from,tx,event,project_dir=nil)
    error = false
    filename = "web.xml"
    require "rexml/document"
    project_dir = event[:project_dir] if project_dir.nil?
  
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
      backfile = "#{project_dir}/tmp/#{filename}.#{Time.new.to_i}"
      tmpoutfile = "#{project_dir}/tmp/#{filename}"
      FileUtils.cp(to,"#{backfile}")
      puts "writing file"
      f = File.new(tmpoutfile, "w")
      todoc.write(f,-1)
      f.flush
      f.close
      Appcelerator::Installer.copy tx,tmpoutfile,to
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
  
  def ensure_element(element,name,key,value)
    element.each_element_with_attribute(key,value,1,name) do |element|
      return element
    end
    return element.add_element(name,{key=>value})
  end
  
  def ensure_simple_element(element,name)
    element.each_element(name) do |element|
      return element
    end
    return element.add_element(name)
  end

  def merge_spring (to,from,tx,event)
    filename ="spring.xml"
    error = false
    require "rexml/document"

    tofile = File.read to
    todoc = REXML::Document.new(tofile)

    fromfile = File.read from
    fromdoc = REXML::Document.new(fromfile)

    fromdoc.root.elements.each("/beans//bean") do |frombean|
      tobean = ensure_element(todoc.root,"bean","id",frombean.attributes['id'])
      merge_bean(frombean,tobean)
    end
    if not error
      backfile = "#{event[:project_dir]}/tmp/#{filename}.#{Time.new.to_i}"
      tmpoutfile = "#{event[:project_dir]}/tmp/#{filename}"
      FileUtils.cp(to,"#{backfile}")
      puts "writing file"
      # require 'stringio'
      # s = StringIO.new
      # todoc.write(s,-1)
      # s.flush
      # s.rewind
      # tx.put tmpoutfile,s.read
      f = File.new(tmpoutfile, "w")
      todoc.write(f,-1)
      f.flush
      f.close
      #puts "#{tmpoutfile} to #{to}"
      Appcelerator::Installer.copy tx,tmpoutfile,to
    end
  end
  
  def get_plugintype(name)
    name.sub(/.*:(.*)/, '\1')
  end
  

  def wrapfilename(file)
    if file.index(" ").nil?
      towin32(file)
    else
      '"'+towin32(file)+'"'
    end
  end

  def merge_attributes(from, to)
    from.attributes.each_attribute do |attribute|
      to.attributes.add(attribute.clone)
    end
  end
  
  def merge_bean (frombean, tobean)
    merge_attributes(frombean,tobean)
    frombean.elements.each("property") do |fromproperty|
      toproperty = ensure_element(tobean,"property","name",fromproperty.attributes['name'])
      merge_property(fromproperty,toproperty)
    end
  end
  
  def merge_property(fromproperty, toproperty)
    merge_attributes(fromproperty,toproperty)
    fromproperty.each_element("map") do |frommap|
      tomap = ensure_simple_element(toproperty,"map")
      merge_map(frommap,tomap)
    end
  end
  
  def merge_map(frommap,tomap)
    merge_attributes(frommap,tomap)
    frommap.each_element("entry") do |fromentry|
      toentry = ensure_element(tomap,"entry","key",fromentry.attributes['key'])
      merge_attributes(fromentry,toentry)
    end
  end
  def Plugin.replace_jar_eclipse(to_version,to_path, tx,name)
    classpath = IO.readlines("#{to_path}/.classpath")
    classpath.each do |line|
      line.gsub!(/appcelerator-plugin-#{name}-([0-9\.])*\.jar/,"appcelerator-plugin-#{name}-#{to_version}.jar")
    end
    tx.put "#{to_path}/.classpath",classpath.join("")
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
