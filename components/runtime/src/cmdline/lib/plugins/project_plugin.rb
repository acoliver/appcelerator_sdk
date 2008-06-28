
class ProjectPlugin < Appcelerator::Plugin

    def after_update_project(event)
      begin
        if event[:config][:aid].nil?
          sid = Installer.get_config[:sid]
          event[:config][:aid] = AID.generate(event[:project_dir],sid,false)
        end
      rescue
      end
    end

    def after_create_project(event)
      begin
        Installer.login_if_required
        sid = Installer.get_config[:sid]
        aid = AID.generate(event[:project_dir],sid)
        message = {'sid' => sid, 'aid' => aid, 'os' => RUBY_PLATFORM, 'name' => event[:name], 
          'directory' => event[:project_dir], 'service' => event[:service]}
        response = Installer.get_client.send('project.create.request', message)[:data]
      rescue
      end
    end

    def before_run_server(event)
      begin
        Installer.login_if_required(true)
        config = Installer.get_project_config(Dir.pwd)
        sid = Installer.get_config[:sid]
        aid = config[:aid]
        if aid.nil?
          aid = AID.create(event[:project_dir],sid) rescue nil
        end
        message = {'sid' => sid, 'aid' => aid, 'os' => RUBY_PLATFORM, 'name' => config[:name], 
          'directory' => event[:project_dir], 'service' => event[:service]}
        response = Installer.get_client.send('project.run.request', message)[:data]
      rescue
      end
    end
end
