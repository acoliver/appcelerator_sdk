
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
        
          version = event[:version]
          plugin_dir = event[:plugin_dir]
          to_dir = event[:to_dir]
          project_dir = event[:project_dir]
          tx = event[:tx]
        
          tx.rm Dir.glob("#{project_dir}/lib/spring-*.jar")
          
          Appcelerator::Installer.copy tx,"#{plugin_dir}/lib/spring-2.5.1.jar", "#{project_dir}/lib/spring-2.5.1.jar"
          Appcelerator::Installer.copy tx,"#{plugin_dir}/templates/spring.xml","#{project_dir}/config/spring.xml"
          Appcelerator::Installer.copy tx,"#{plugin_dir}/spring_license.txt", "#{to_dir}/spring_license.txt"
          Appcelerator::Installer.copy tx,"#{plugin_dir}/spring_notice.txt", "#{to_dir}/spring_notice.txt"

          require "rexml/document"
      
          webxml = File.read "#{project_dir}/config/web.xml"
          doc = REXML::Document.new(webxml)
      
          found = nil
          doc.root.elements.each 'context-param/param-name' do |element|
            if element.text.strip == 'contextConfigLocation'
              found = element.parent
              break
            end
          end
      
          error = false
      
          if found.nil?
            param = REXML::Element.new 'context-param'
            name = REXML::Element.new 'param-name'
            value = REXML::Element.new 'param-value'
            name.text = 'contextConfigLocation'
            value.text = '/WEB-INF/classes/spring.xml' 
            param.add name
            param.add value
        
            children = doc.root.elements
            added = false
            children.each_with_index do |element,idx|
              if element.name == 'servlet'
                element.parent.insert_after element.previous_element,param
                added = true
                break
              end
            end
        
            if not added
              # oops, fell off the end
              STDERR.puts "ERROR: Couldn't add Spring context-param to your web.xml. You will need to do this manually."
              error = false
            end
          end

          found = nil
          doc.root.elements.each 'listener/listener-class' do |element|
            if element.text.strip == 'org.springframework.web.context.ContextLoaderListener'
              found = element
              break
            end
          end

          if found.nil?
            listener = REXML::Element.new 'listener'
            listener_class = REXML::Element.new 'listener-class'
            listener.add listener_class
            listener_class.text = 'org.springframework.web.context.ContextLoaderListener'
        
            children = doc.root.elements
            added = false
            children.each_with_index do |element,idx|
              if element.name == 'servlet'
                element.parent.insert_after element.previous_element,listener
                added = true
                break
              end
            end
        
            if not added
              # oops, fell off the end
              STDERR.puts "ERROR: Couldn't add Spring listener to your web.xml. You will need to do this manually."
              error = false
            end
          end

          if not error
            require 'stringio'
            s = StringIO.new
            doc.write s,3
            s.flush
            s.rewind
            tx.put "#{project_dir}/config/web.xml",s.read
          end
      end
    end
end
