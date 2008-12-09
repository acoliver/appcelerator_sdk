
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
        puts args.inspect()
        Installer.message("project_#{type}", args)

      rescue => e
        if OPTIONS[:debug]
          $stderr.puts e.backtrace 
          $stderr.puts "received error: #{e}"
        end
      end
    end

    def get_project(event)

        if event[:project]
          return event[:project]
        elsif event[:project_dir]
          return Project.load(event[:project_dir])
        end

    end

    def after_update_project(event)
      p = get_project(event)
      project_request(p, 'update')
    end
    
    def after_package_project(event)
      p = get_project(event)
      project_request(p, 'package', {'target_os' => event[:os]})
    end

    def after_launch_project(event)
      p = get_project(event)
      project_request(p, 'launch')
    end

    def after_create_project(event)
      p = get_project(event)
      project_request(p, 'create')
    end

    def before_run_server(event)
      p = get_project(event)
      project_request(p, 'run')
    end
end
