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
  class Plugin
    def event(name,event)
      if self.respond_to?(:on_event)
        self.send :on_event,event
      end
      if self.respond_to?(name)
        self.send name,event
      end
    end
  end  
  class PluginManager
    @@plugins = Array.new
    
    def PluginManager.dispatchEvent(name,event)
      puts "--> event => #{name} with #{event.inspect}" if OPTIONS[:debug]
      @@plugins.each do |plugin|
        plugin.event name,event
      end
    end
    
    def PluginManager.dispatchEvents(nameSuffix,event)
      PluginManager.dispatchEvent('before_'+nameSuffix,event)
      begin
        yield if block_given?
      ensure
        PluginManager.dispatchEvent('after_'+nameSuffix,event)
      end
    end
    
    def PluginManager.addPlugin(p)
      @@plugins << p
      if p.respond_to? :plugin_registered
        p.send :plugin_registered
      end
    end
    
    def PluginManager.removePlugin(p)
      @@plugins.remove p
      if p.respond_to? :plugin_unregistered
        p.send :plugin_unregistered
      end
    end
    
    def PluginManager.loadPlugins
      PluginManager.preloadPlugins
      path = Dir.pwd
      if path 
        path = path.path if path.class==Dir
        if File.exists? path and File.exists? "#{path}/plugins"
          Dir["#{path}/plugins/*"].each do |dir|
            begin
              if File.file?(dir) and File.extname(dir)=='.rb'
                # load plugins in same directory as plugins
                require dir
              elsif File.directory?(dir)
                # load any plugins that are subdirectories under plugins directory
                # as long as the directory name and plugin name are the same
                name = File.dirname(dir)
                prb = "#{dir}/#{name}"
                if File.exists?("#{prb}.rb")
                  require prb
                end
              end
            rescue => e
              STDERR.puts "Error loading plugin: #{name}.  Error: #{e}"
            end
          end
        end
      end
      p = []
      # scan and add all of our plugins
      Object::constants.each do |c|
        cl = Object.const_get(c)
        if cl.class == Class and cl.superclass==Appcelerator::Plugin
          p << cl.to_s
          Appcelerator::PluginManager.addPlugin(cl.new) 
        end
      end
      show = OPTIONS[:debug] and p.length > 0
      name = 'plugin' + (p.length > 1 ? 's' : '')
      puts "--> Loading #{name}: #{p.join(',')}" if show
    end
    
    def PluginManager.preloadPlugins
      Appcelerator::Installer.with_site_config(false) do |config|
        onload = config[:onload]
        if onload
          onload.each do |l|
            next unless l.class == Hash
            path = l[:path]
            next unless File.exists? path
            name = path.gsub('.rb','')
            begin
              require name
            rescue => e
              STDERR.puts "Error loading plugin: #{name}.  Error: #{e}"
            end
          end
        end
      end
    end
  end
  
  class PluginUtil
    def PluginUtil.merge_spring (to,from,tx,event)
      filename ="spring.xml"
      error = false
      require "rexml/document"

      tofile = File.read to
      todoc = REXML::Document.new(tofile)

      fromfile = File.read from
      fromdoc = REXML::Document.new(fromfile)

      fromdoc.root.elements.each("/beans//bean") do |frombean|
        tobean = PluginUtil.ensure_element(todoc.root,"bean","id",frombean.attributes['id'])
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
        PluginUtil.tidy(tmpoutfile,tmpoutfile)
        #puts "#{tmpoutfile} to #{to}"
        Appcelerator::Installer.copy tx,tmpoutfile,to
      end
    end
    
    def PluginUtil.get_plugintype(name)
      name.sub(/.*:(.*)/, '\1')
    end
    
    def PluginUtil.merge_webxml (to,from,tx,event,project_dir=nil)
      error = false
      filename = "web.xml"
      require "rexml/document"
      project_dir = event[:project_dir] if project_dir.nil?

      tofile = File.read to
      todoc = REXML::Document.new(tofile)

      fromfile = File.read from
      fromdoc = REXML::Document.new(fromfile)

      fromdoc.root.elements.each("/web-app//context-param") do |fromcontextparam|
        paramname = PluginUtil.get_subelementtext(fromcontextparam,"param-name")
        tocontextparam = PluginUtil.ensure_element_namedsubelment(todoc.root,"context-param","param-name",paramname,["param-value"])
        tocontextparam.get_elements("param-value")[0].text = fromcontextparam.get_elements("param-value")[0].text
        # puts "merged: #{tocontextparam}"
      end
      fromdoc.root.elements.each("/web-app//listener") do |listener|
        listenerclass = PluginUtil.get_subelementtext(listener,"listener-class")
        tolistener = PluginUtil.ensure_element_subelment(todoc.root,"listener","listener-class",listenerclass)
        tolistener.get_elements("listener-class")[0].text = listener.get_elements("listener-class")[0].text
        # puts "merged: #{tolistener}"
      end
      fromdoc.root.elements.each("/web-app//servlet") do |fromservlet|
        servletname = PluginUtil.get_subelementtext(fromservlet,"servlet-name")
        toservlet = PluginUtil.ensure_element_namedsubelment(todoc.root,"servlet","servlet-name",servletname,["servlet-class","load-on-startup"])
        toservlet.get_elements("servlet-class")[0].text = fromservlet.get_elements("servlet-class")[0].text
        toservlet.get_elements("load-on-startup")[0].text = fromservlet.get_elements("load-on-startup")[0].text
        fromservlet.elements.each("//init-param") do |frominitparam|
          paramname = PluginUtil.get_subelementtext(frominitparam,"param-name")
          if !paramname.nil? && paramname!=""
            # puts "adding init param #{paramname} for servlet #{servletname}"
            toinitparam = PluginUtil.ensure_element_namedsubelment(toservlet,"init-param","param-name",paramname,["param-value"])
            toinitparam.get_elements("param-value")[0].text = frominitparam.get_elements("param-value")[0].text
          end
        end
        # puts "merged: #{toservlet}"
      end
      fromdoc.root.elements.each("/web-app//servlet-mapping") do |fromservletmapping|
        servletname = PluginUtil.get_subelementtext(fromservletmapping,"servlet-name")
        toservletmapping = PluginUtil.ensure_element_namedsubelment(todoc.root,"servlet-mapping","servlet-name",servletname,["url-pattern"])
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
        PluginUtil.tidy(tmpoutfile,tmpoutfile)
        Appcelerator::Installer.copy tx,tmpoutfile,to
      end
    end
    
    def PluginUtil.ensure_element_subelment(parentelement,name,sub_name,value)
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
    
    def PluginUtil.ensure_simple_element(element,name)
      element.each_element(name) do |element|
        return element
      end
      return element.add_element(name)
    end

    def PluginUtil.get_subelementtext(element,subtag)
      subelement = element.get_elements(subtag)[0]
      subelement.get_text
    end
    
    def PluginUtil.ensure_element_namedsubelment(parentelement,name,sub_name,value,sub_values)
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
    
    def PluginUtil.ensure_element(element,name,key,value)
      element.each_element_with_attribute(key,value,1,name) do |element|
        return element
      end
      return element.add_element(name,{key=>value})
    end
    
    def PluginUtil.ensure_simple_element(element,name)
      element.each_element(name) do |element|
        return element
      end
      return element.add_element(name)
    end

    def PluginUtil.clean_jar(file)
      if File.exists?(file)
        File.delete(file)
      end
    end
    
    def PluginUtil.clean_dir(dir)
      FileUtils.rm_r dir if File.exists?(dir)
    end
    
    def PluginUtil.jar(destfile, dir)
      FileUtils.cd(dir) do |dir|
        system "jar cf #{destfile} ."
      end
    end
    
    def PluginUtil.compile(libdir,java_source, java_classes)
        PluginUtil.clean_dir(java_classes)
        FileUtils.mkdir_p java_classes
        src = Dir["#{java_source}/**/*.java"].inject([]) {|a,f| a<<f }
        FileUtils.mkdir_p "#{java_classes}" unless File.exists? "#{java_classes}"
        java_path_separator = separator
        FileUtils.cd("#{libdir}") do |dir|
          cp = Dir["**/*.jar"].inject([]) {|a,f| a<<f }
          system "javac -g -cp #{cp.join(java_path_separator)} #{src.join(' ')} -target 1.5 -d #{java_classes}"
        end
    end
    
    def PluginUtil.separator
      case Config::CONFIG['target_os']
        when /darwin/
          return ":"
        when /linux/
          return ":"
        when /(windows|win32)/
          return ";"
      end
    end
    
    def PluginUtil.merge_attributes(from, to)
      from.attributes.each_attribute do |attribute|
        to.attributes.add(attribute.clone)
      end
    end
    
    def PluginUtil.merge_bean (frombean, tobean)
      PluginUtil.merge_attributes(frombean,tobean)
      frombean.elements.each("property") do |fromproperty|
        toproperty = PluginUtil.ensure_element(tobean,"property","name",fromproperty.attributes['name'])
        PluginUtil.merge_property(fromproperty,toproperty)
      end
    end
    
    def PluginUtil.merge_property(fromproperty, toproperty)
      PluginUtil.merge_attributes(fromproperty,toproperty)
      fromproperty.each_element("map") do |frommap|
        tomap = PluginUtil.ensure_simple_element(toproperty,"map")
        PluginUtil.merge_map(frommap,tomap)
      end
    end
    
    def PluginUtil.merge_map(frommap,tomap)
      PluginUtil.merge_attributes(frommap,tomap)
      frommap.each_element("entry") do |fromentry|
        toentry = PluginUtil.ensure_element(tomap,"entry","key",fromentry.attributes['key'])
        PluginUtil.merge_attributes(fromentry,toentry)
      end
    end
    
    def PluginUtil.install_java (event)
      if File.exist? "#{event[:plugin_dir]}/java"
        name = Appcelerator::PluginUtil.get_plugintype(event[:name])
        puts "building jar"
        jarfile = "#{event[:to_dir]}/appcelerator-plugin-#{name}.jar"
        Appcelerator::PluginUtil.clean_jar(jarfile)
        Appcelerator::PluginUtil.compile("#{event[:project_dir]}/lib","#{event[:plugin_dir]}/java","#{event[:to_dir]}/classes")
        Appcelerator::PluginUtil.jar(jarfile, "#{event[:to_dir]}/classes")
        Appcelerator::PluginUtil.clean_dir("#{event[:to_dir]}/classes")
        Appcelerator::Installer.remove_prev_jar(event[:tx],"appcelerator-plugin-#{name}","#{event[:project_dir]}/lib")
        Appcelerator::Installer.copy(event[:tx],jarfile, "#{event[:project_dir]}/lib/appcelerator-plugin-#{name}-#{event[:version]}.jar")
      end
      if File.exist? "#{event[:plugin_dir]}/spring.xml"
        puts "merging spring"
        Appcelerator::PluginUtil.merge_spring("#{event[:project_dir]}/config/spring.xml","#{event[:plugin_dir]}/spring.xml",event[:tx],event)
      end

      if File.exist? "#{event[:plugin_dir]}/web.xml"
        puts "merging web.xml"
        Appcelerator::PluginUtil.merge_webxml("#{event[:project_dir]}/config/web.xml","#{event[:plugin_dir]}/web.xml",event[:tx],event)
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
    
    def PluginUtil.tidy(from,to)
      if PluginUtil.load_tidy
        # for a listing of options see http://tidy.sourceforge.net/docs/quickref.html
        options = {'input-xml' => true,'output-xml' => true,:show_warnings => true, 'indent' => true, 'indent-cdata' => false,
          'wrap' => 0}
        xmlsrc = IO.readlines(from)
        xml = Tidy.open(options) do |tidy|
          # puts tidy.options.show_warnings
          xml = tidy.clean(xmlsrc)
          # puts tidy.errors
          # puts tidy.diagnostics
          xml
        end
      end
      f = File.open to,'w'
      f.write xml
      f.close
    end
    def PluginUtil.load_tidy
      begin
        $:.push File.expand_path("../vendor", File.dirname(__FILE__))
        require 'tidy'
        case Config::CONFIG['target_os']
          when /darwin/
            Tidy.path = "/usr/lib/libtidy.dylib"
            true
          when /linux/
            Tidy.path = "/usr/lib/libtidy.so"
            true
          when /(windows|win32)/
            false
        end
      rescue LoadError => err
        puts "could not load tidy: #{err}"
        return false
      end
    end
  end
end
