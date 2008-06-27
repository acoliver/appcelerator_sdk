
class ProjectPlugin < Appcelerator::Plugin

    def after_create_project(event)
      begin
        Installer.login_if_required
        message = {'sid' => Installer.get_config[:sid], 'os' => RUBY_PLATFORM, 'name' => event[:name], 
          'directory' => event[:project_dir], 'service' => event[:service]}
        response = Installer.get_client.send('project.create.request', message)[:data]
      rescue
      end
    end

    def before_run_server(event)
      begin
        Installer.login_if_required
        config = Installer.get_project_config(Dir.pwd)
        message = {'sid' => Installer.get_config[:sid], 'os' => RUBY_PLATFORM, 'name' => config[:name], 
          'directory' => event[:project_dir], 'service' => event[:service]}
        response = Installer.get_client.send('project.run.request', message)[:data]
      rescue
      end
    end
end
