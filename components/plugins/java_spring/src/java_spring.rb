
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
          Appcelerator::Installer.copy "#{plugin_dir}/templates/spring.xml","#{project_dir}/config"
          puts "Added java:spring plugin,#{version}"
      end
    end
end
