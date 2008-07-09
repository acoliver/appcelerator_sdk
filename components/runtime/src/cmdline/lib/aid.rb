
module Appcelerator
  class AID

    def AID.generate_new(project_dir)
      require 'tmpdir'
      file = UUID.setup(File.expand_path(File.join(Dir::tmpdir,'uuid.state')))
      UUID.config :state_file => file.to_s
      UUID.new
    end
    
    def AID.new_config_entry(project_dir,entry,value)
      f = File.expand_path File.join(project_dir,'public','appcelerator.xml')
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
    
    def AID.generate(project_dir,sid,save=true)
      aid = AID.generate_new project_dir
      AID.new_config_entry(project_dir,'aid',aid)
      AID.new_config_entry(project_dir,'sid',sid)
      if save
        Installer.with_project_config(project_dir,true) do |config|
          config[:aid] = aid
        end
      end
      aid
    end
  end
end