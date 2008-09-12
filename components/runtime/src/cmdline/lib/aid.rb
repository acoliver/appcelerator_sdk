
module Appcelerator
  class AID

    def AID.generate_new(project_dir)
      file = UUID.setup(File.expand_path(File.join(APP_TEMP_DIR,'uuid.state')))
      UUID.config(:state_file => file.to_s)
      UUID.new
    end
    
    def AID.new_config_entry(project,entry,value)
      f = project.get_web_path('appcelerator.xml')
      if File.exists?(f)
        xml = File.read(f)
        if xml.index("<#{entry}>").nil?
          xml.gsub!('</appcelerator>',"    <#{entry}>#{value}</#{entry}>\n</appcelerator>")
          f = File.open f,'w+'
          f.puts xml
          f.close
        end
      end
    end
    
    def AID.generate(project,sid,save=true)
      aid = AID.generate_new(project)
      AID.new_config_entry(project,'aid',aid)
      AID.new_config_entry(project,'sid',sid)
      project.config[:aid] = aid

      if save
        project.save_config()
      end

      aid
    end
  end
end
