
#
# ExamplePlugin
#
# You can implement the methods below that you want. There is no reason
# to implement them all and in fact, you can safely remove methods below
# that you don't intend to implement.
#
class ExamplePlugin < Appcelerator::Plugin
    def plugin_registered
      # called when this plugin is loaded
    end
    def before_command(command,argHash,opts)
      # called before a command executes
    end
    def after_command(command,argHash,opts)
      # called after a command executes 
    end
    def before_create_project(to,from,name,language,version,transaction)
      # called before a project is created
    end
    def after_create_project(config,success,transaction)
      # called after a project is created
    end
    def before_web_sdk_install(target_dir,version)
      # called before the web sdk is installed
    end
    def after_web_sdk_install(target_dir,version)
      # called after the web sdk is installed
    end
    def before_copy_web(options,source_dir,version,tx)
      # called before the web assets are copied into a project
    end
    def after_copy_web(options,source_dir,version,tx)
      # called after the web assets are copied into a project
    end
    def before_create_plugin(project_dir,name)
      # called before a plugin project is created
    end
    def after_create_plugin(project_dir,name)
      # called after a plugin project is created
    end
    def before_install_plugin(location,name,version,path)
      # called before a plugin is installed
    end
    def after_install_plugin(location,name,version,path)
      # called after a plugin is installed
    end
    def before_add_widget(widget_name,version,widget_dir,to_dir)
      # called before a widget is added to a project directory
    end
    def after_add_widget(widget_name,version,widget_dir,to_dir)
      # called after a widget is added to a project directory
    end
    def before_create_html(html,language)
      # called before an HTML template is created in a project directory
    end
    def after_create_html(html,language)
      # called after an HTML template is created in a project directory
    end
    def before_run_server(directory,language)
      # called before the project specific server is run
    end
    def after_run_server(directory,language)
      # called after the project specific server is run
    end
    def before_create_war(directory)
      # called before a project war is created for java
    end
    def after_create_war(directory)
      # called after a project war is created for java
    end
    def before_add_plugin(plugin_name,version,plugin_dir,to_dir,project_dir,tx)
      # called before a plugin is added to a project
    end
    def after_add_plugin(plugin_name,version,plugin_dir,to_dir,project_dir,tx)
      # called after a plugin is added to a project
    end
    def before_install_component(type,from,name,version,to_dir)
      # called before a component is installed
    end
    def after_install_component(type,from,name,version,to_dir)
      # called after a component is installed
    end
end
