
class ProjectPlugin < Appcelerator::Plugin

    def project_request(project, type, args_in = {})
      begin 
        Installer.login_if_required

        config = Installer.get_config()
        sid = config[:sid]

        if project.config[:aid].nil?
          AID.generate(project, sid, false)
        end
        args = {
          'aid' => project.config[:aid],
          'name' => project.name,
          'directory' => project.path,
          'service' => project.service_type
        }
        args.merge!(args_in)
        Installer.message("project_#{type}", args)

      rescue => e
        if OPTIONS[:debug]
          $stderr.puts e.backtrace 
          $stderr.puts "received error: #{e}"
        end
      end
    end

    def after_update_project(event)
      project_request(event[:project], 'update')
    end
    
    def after_package_project(event)
      project_request(event[:project], 'package', {'target_os' => event[:os]})
    end

    def after_launch_project(event)
      project_request(event[:project], 'launch')
    end

    def after_create_project(event)
      project_request(event[:project], 'create')
    end

    def before_run_server(event)
      project_request(event[:project], 'run')
    end
end
