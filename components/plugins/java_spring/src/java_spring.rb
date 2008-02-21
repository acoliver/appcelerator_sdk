
#
# JavaSpring
#
# You can implement the methods below that you want. There is no reason
# to implement them all and in fact, you can safely remove methods below
# that you don't intend to implement.
#
class JavaSpring < Appcelerator::Plugin
    def before_add_plugin(plugin_name,version,plugin_dir,to_dir,project_dir)
      if plugin_name == 'java:spring'
        
          Appcelerator::Installer.copy "#{plugin_dir}/lib/spring-2.5.1.jar", "#{project_dir}/lib"
          Appcelerator::Installer.copy "#{plugin_dir}/templates/spring.xml","#{project_dir}/config"
          Appcelerator::Installer.copy "#{plugin_dir}/spring_license.txt", "#{to_dir}"
          Appcelerator::Installer.copy "#{plugin_dir}/spring_notice.txt", "#{to_dir}"

          if OPTIONS[:force] or confirm "Add spring config to #{project_dir}config/web.xml? [Y]",true,false
            require "rexml/document"
          
            webxml = File.read "#{project_dir}config/web.xml"
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
              f = File.new "#{project_dir}/config/web.xml", 'w+'
              doc.write f,3
              f.close
            end
          end
      end
    end
end
