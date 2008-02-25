
#
# ExamplePlugin
#
# You can implement the methods below that you want. There is no reason
# to implement them all and in fact, you can safely remove methods below
# that you don't intend to implement.
#
class ExamplePlugin < Appcelerator::Plugin
    def on_event(event)
      # this is a catch-all event method - will catch everything
    end
    def plugin_registered(event)
      # called when this plugin is loaded
    end
    def before_command(event)
      # called before a command executes
    end
    def after_command(event)
      # called after a command executes 
    end
    def before_create_project(event)
      # called before a project is created
    end
    def after_create_project(event)
      # called after a project is created
    end
    def before_update_project(event)
      # called before a project is updated
    end
    def after_update_project(event)
      # called after a project is updated
    end
    def before_web_sdk_install(event)
      # called before the web sdk is installed
    end
    def after_web_sdk_install(event)
      # called after the web sdk is installed
    end
    def before_copy_web(event)
      # called before the web assets are copied into a project
    end
    def after_copy_web(event)
      # called after the web assets are copied into a project
    end
    def before_create_plugin(event)
      # called before a plugin project is created
    end
    def after_create_plugin(event)
      # called after a plugin project is created
    end
    def before_install_plugin(event)
      # called before a plugin is installed
    end
    def after_install_plugin(event)
      # called after a plugin is installed
    end
    def before_add_widget(event)
      # called before a widget is added to a project directory
    end
    def after_add_widget(event)
      # called after a widget is added to a project directory
    end
    def before_create_html(event)
      # called before an HTML template is created in a project directory
    end
    def after_create_html(event)
      # called after an HTML template is created in a project directory
    end
    def before_run_server(event)
      # called before the project specific server is run
    end
    def after_run_server(event)
      # called after the project specific server is run
    end
    def before_create_war(event)
      # called before a project war is created for java
    end
    def after_create_war(event)
      # called after a project war is created for java
    end
    def before_add_plugin(event)
      # called before a plugin is added to a project
    end
    def after_add_plugin(event)
      # called after a plugin is added to a project
    end
    def before_install_component(event)
      # called before a component is installed
    end
    def after_install_component(event)
      # called after a component is installed
    end
end
