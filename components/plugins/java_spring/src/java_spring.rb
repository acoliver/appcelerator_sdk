
#
# JavaSpring
#
# You can implement the methods below that you want. There is no reason
# to implement them all and in fact, you can safely remove methods below
# that you don't intend to implement.
#
class JavaSpring < Appcelerator::Plugin
  def before_add_plugin(event)
    if event[:name] == 'java:spring'
      tx = event[:tx]
      event[:tx].rm Dir.glob("#{event[:project_dir]}/lib/spring-*.jar")
      Appcelerator::Installer.copy event[:tx],"#{event[:plugin_dir]}/templates/spring.xml","#{event[:project_dir]}/config/spring.xml"
      Appcelerator::Installer.copy event[:tx],"#{event[:plugin_dir]}/spring_license.txt", "#{event[:to_dir]}/spring_license.txt"
      Appcelerator::Installer.copy event[:tx],"#{event[:plugin_dir]}/spring_notice.txt", "#{event[:to_dir]}/spring_notice.txt"
      
      if File.exist? "#{event[:plugin_dir]}/java"
        name = get_plugintype(event[:name])
        puts "building jar"
        jarfile = "#{event[:to_dir]}/appcelerator-plugin-#{name}.jar"
        puts "#{jarfile}"
        clean_jar(jarfile)
        compile("#{event[:project_dir]}/lib","#{event[:plugin_dir]}/java","#{event[:to_dir]}/classes")
        jar(jarfile, "#{event[:to_dir]}/classes")
        clean_dir("#{event[:to_dir]}/classes")
        Appcelerator::Installer.copy tx,jarfile, "#{event[:project_dir]}/lib/appcelerator-plugin-#{name}.jar"
      end
      if File.exist? "#{event[:plugin_dir]}/spring.xml"
        puts "merging spring"
        merge_spring("#{event[:project_dir]}/config/spring.xml","#{event[:plugin_dir]}/spring.xml",event[:tx],event)
      end

      puts "checking #{event[:plugin_dir]}/web.xml"
      if File.exist? "#{event[:plugin_dir]}/web.xml"
        puts "merging web.xml"
        merge_webxml("#{event[:project_dir]}/config/web.xml","#{event[:plugin_dir]}/web.xml",event[:tx],event)
      end
      if File.exist? "#{event[:plugin_dir]}/web"
        puts "copying web source"
        Appcelerator::Installer.copy tx,"#{event[:plugin_dir]}/web","#{event[:project_dir]}/public"
      end
      if File.exist? "#{event[:plugin_dir]}/lib"
        puts "copying lib"
        Appcelerator::Installer.copy tx,"#{event[:plugin_dir]}/lib","#{event[:project_dir]}/lib"
      end
    end
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
      puts "#{tmpoutfile} to #{to}"
      Appcelerator::Installer.copy tx,tmpoutfile,to
    end
  end
  def get_plugintype(name)
    name.sub(/.*:(.*)/, '\1')
  end
  def merge_webxml (to,from,tx,event)
    error = false
    filename = "web.xml"
    require "rexml/document"

    tofile = File.read to
    todoc = REXML::Document.new(tofile)

    fromfile = File.read from
    fromdoc = REXML::Document.new(fromfile)

    fromdoc.root.elements.each("/web-app//context-param") do |fromcontextparam|
      paramname = get_subelementtext(fromcontextparam,"param-name")
      tocontextparam = ensure_element_namedsubelment(todoc.root,"context-param","param-name",paramname,"param-value")
      tocontextparam.get_elements("param-value")[0].text = fromcontextparam.get_elements("param-value")[0].text
      # puts "merged: #{tocontextparam}"
    end
    fromdoc.root.elements.each("/web-app//listener") do |listener|
      listenerclass = get_subelementtext(listener,"listener-class")
      tolistener = ensure_element_subelment(todoc.root,"listener","listener-class",listenerclass)
      tolistener.get_elements("listener-class")[0].text = listener.get_elements("listener-class")[0].text
      # puts "merged: #{tolistener}"
    end
    if not error
      backfile = "#{event[:project_dir]}/tmp/#{filename}.#{Time.new.to_i}"
      tmpoutfile = "#{event[:project_dir]}/tmp/#{filename}"
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
  def ensure_element_namedsubelment(parentelement,name,sub_name,value,sub_value)
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
    newelement.add_element(sub_value)
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

  def clean_jar(file)
    if File.exists?(file)
      File.delete(file)
    end
  end
  def clean_dir(dir)
    FileUtils.rm_r dir if File.exists?(dir)
  end
  def jar(destfile, dir)
    FileUtils.cd(dir) do |dir|
      system "jar cf #{destfile} ."
    end
  end
  def compile(libdir,java_source, java_classes)
      clean_dir(java_classes)
      FileUtils.mkdir_p java_classes
      cp = Dir["#{libdir}/**/*.jar"].inject([]) {|a,f| a<<f }
      src = Dir["#{java_source}/**/*.java"].inject([]) {|a,f| a<<f }
      FileUtils.mkdir_p "#{java_classes}" unless File.exists? "#{java_classes}"
      java_path_separator = separator
      system "javac -cp #{cp.join(java_path_separator)} #{src.join(' ')} -target 1.5 -d #{java_classes}"
  end
  def separator
    case Config::CONFIG['target_os']
      when /darwin/
        return ":"
      when /linux/
        return ":"
      when /(windows|win32)/
        return ";"
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
end
