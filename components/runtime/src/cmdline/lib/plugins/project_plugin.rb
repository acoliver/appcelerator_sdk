
class ProjectPlugin < Appcelerator::Plugin

    def after_update_project(event)
      project = event[:project]

      begin
        sid = Installer.get_config[:sid]
        aid = project.config[:aid] || AID.generate(project.path,sid,false)
        message = {'sid' => sid,
                   'aid' => aid,
                   'os' => RUBY_PLATFORM,
                   'name' => project.name,
                   'directory' => project.path,
                   'service' => project.service_type}
        response = Installer.get_client.send('project.update.request', message)[:data]
      rescue => e
        if OPTIONS[:debug]
          $stderr.puts e.backtrace 
          $stderr.puts "received error: #{e}"
        end
      end
    end
    
    def after_package_project(event)
      project = event[:project]

      begin
        Installer.login_if_required
        sid = Installer.get_config[:sid]
        aid = project.config[:aid] || AID.generate(project.path,sid,false)
        message = {'sid' => sid,
                   'aid' => aid,
                   'os' => RUBY_PLATFORM,
                   'name' => project.name,
                   'directory' => project.path,
                   'service' => project.service_type,
                   'target_os' => event[:os]}
        response = Installer.get_client.send('project.package.request', message)[:data]
      rescue
        if OPTIONS[:debug]
          $stderr.puts e.backtrace 
          $stderr.puts "received error: #{e}"
        end
      end
    end

    def after_launch_project(event)
      project = event[:project]

      begin
        Installer.login_if_required
        sid = Installer.get_config[:sid]
        aid = project.config[:aid] || AID.generate(project.path,sid,false)
        message = {'sid' => sid,
                   'aid' => aid,
                   'os' => RUBY_PLATFORM,
                   'name' => project.name,
                   'directory' => project.path,
                   'service' => project.service_type,
                   'target_os' => event[:os]}
        response = Installer.get_client.send('project.launch.request', message)[:data]
      rescue => e
        if OPTIONS[:debug]
          $stderr.puts e.backtrace 
          $stderr.puts "received error: #{e}"
        end
      end
    end

    def after_create_project(event)
      project = event[:project]

      begin
        Installer.login_if_required
        sid = Installer.get_config[:sid]
        aid = project.config[:aid] || AID.generate(project.path,sid,false)
        message = {'sid' => sid,
                   'aid' => aid,
                   'os' => RUBY_PLATFORM,
                   'name' => project.name,
                   'directory' => project.path,
                   'service' => project.service_type }
        response = Installer.get_client.send('project.create.request', message)[:data]
      rescue => e
        if OPTIONS[:debug]
          $stderr.puts e.backtrace 
          $stderr.puts "received error: #{e}"
        end
      end
    end

    def before_run_server(event)
      project = event[:project]

      begin
        Installer.login_if_required(true)
        sid = Installer.get_config[:sid]
        aid = project.config[:aid] || AID.generate(project.path,sid,false)
        message = {'sid' => sid,
                   'aid' => aid,
                   'os' => RUBY_PLATFORM,
                   'name' => project.config[:name],
                   'directory' => project.path,
                   'service' => project.service_type }
        response = Installer.get_client.send('project.run.request', message)[:data]
      rescue => e
        if OPTIONS[:debug]
          $stderr.puts e.backtrace 
          $stderr.puts "received error: #{e}"
        end
      end
    end
end
