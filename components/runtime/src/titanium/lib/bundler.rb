#
# Copyright 2006-2008 Appcelerator, Inc.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#    http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

require 'erb'

module Titanium
  class Bundler
    def Bundler.copy_template(template_file, dest)
      config = Titanium.create_config_from_dir(@@path)
      contents = File.read(template_file)
      f_binding = binding
      template = ERB.new contents
      File.open(dest, 'w') { |f| f.write(template.result(f_binding)) }
    end
    
    def Bundler.copy_tiapp_xml(dest)
      # if the app has a tiapp.xml, use it
      custom_tiappxml = false
      if Project.is_project_dir?(@@path)
        tixml = File.join(@@project.path, 'config', 'tiapp.xml')
        if File.exists? File.expand_path(tixml)
          FileUtils.cp tixml, dest
          custom_tiappxml = true
        end
      end
      
      if not custom_tiappxml and not @@xml.nil?
        FileUtils.cp @@xml, dest
        custom_tiappxml = true
      end
      
      if !custom_tiappxml
        # at this point create a default tiapp.xml
        Bundler.copy_template(
          File.join(Titanium.get_support_dir(), 'default_tiapp.xml.template'),
          dest)
      end
    end
    
    def Bundler.copy_resource_files(exclude_folder, dest)
      if not @@project.nil?
        FileUtils.cp_r File.join(@@project.path, 'public'), dest
      else
        copy_files = []
        Dir.open(Dir.pwd) do |dir|
          dir.each do |filename|
            if File.directory?(File.join(Dir.pwd, filename)) and filename != "." and filename != ".."
              if filename != exclude_folder
                copy_files << File.join(Dir.pwd, filename)
              end
            elsif File.file?(File.join(Dir.pwd, filename))
              copy_files << File.join(Dir.pwd, filename)
            end
          end
        end

        puts "cp -r #{copy_files} #{dest}"
        FileUtils.cp_r copy_files, dest
      end
    end
    
    
    def Bundler.create_osx_app
      # store these as class variables for now so we can access them in other functions
      app_folder = File.join(@@dest, @@executable_name + ".app")
      contents_folder = File.join(app_folder, 'Contents')
      macos_folder = File.join(contents_folder, 'MacOS')
      resources_folder = File.join(contents_folder, 'Resources')
      titanium_folder = File.join(resources_folder, 'titanium')
      osx_support_folder = File.join(Titanium.get_support_dir(), 'osx')

      FileUtils.mkdir_p [app_folder, contents_folder, macos_folder, resources_folder, titanium_folder]
      
      FileUtils.cp Titanium.get_executable(), File.join(macos_folder, @@executable_name)
      FileUtils.chmod 0755, File.join(macos_folder, @@executable_name)
      Bundler.copy_resource_files(@@executable_name + ".app", resources_folder)

      patch_plist = false
      
      if File.exists? File.join(@@project.path,'config',"#{@@executable_name}.icns")
        FileUtils.cp File.join(@@project.path,'config',"#{@@executable_name}.icns"), resources_folder
        patch_plist = true
      else
        FileUtils.cp File.join(osx_support_folder, 'titanium.icns'), resources_folder
      end  
          
      FileUtils.cp File.join(Titanium.get_support_dir, 'titanium_poweredby.png'), resources_folder
      
      Bundler.copy_template(
        File.join(osx_support_folder, 'Info.plist.template'),
        File.join(contents_folder, 'Info.plist'))
        
      if patch_plist
        pl = File.join(contents_folder, 'Info.plist')
        plist = File.read(pl)
        plist.gsub! 'titanium.icns',"#{@@executable_name}.icns"
        f = File.open pl, 'w'
        f.puts plist
        f.close
      end

      Bundler.copy_tiapp_xml(File.join(resources_folder, 'tiapp.xml'))
      
      # Bundler.copy_template(
      #   File.join(Titanium.get_support_dir(), 'plugins.js.template'),
      #   File.join(titanium_folder, 'plugins.js'))
      
      Dir[File.join(Titanium.get_component_dir(), "**", "*.js")].each do |jsfile|
        FileUtils.cp jsfile, titanium_folder
      end
      
      FileUtils.cp_r File.join(Titanium.get_app_path(), 'Contents', 'Resources', "English.lproj"), resources_folder
      
      Titanium.each_plugin do |plugin|
        plugin.install(@@project, @@dest, @@executable_name)
      end
      
      puts "#{@@executable_name}.app created in #{@@dest}"
    end
    
    def Bundler.launch_osx_app
      system File.join(File.join(@@dest, @@executable_name) + ".app", 'Contents', 'MacOS', @@executable_name)
    end
    
    def Bundler.create_win_exe
		  app_folder = File.join(@@dest, @@executable_name)

		  resources_folder = File.join(app_folder, 'Resources')
		  titanium_folder = File.join(resources_folder, 'titanium')
		  FileUtils.mkdir_p [app_folder, resources_folder, titanium_folder]

		  FileUtils.cp Titanium.get_executable(), File.join(app_folder, @@executable_name+".exe")
      Bundler.copy_resource_files(@@executable_name, resources_folder)
		  Bundler.copy_tiapp_xml(File.join(resources_folder, 'tiapp.xml'))
      
      # Bundler.copy_template(
      #   File.join(Titanium.get_support_dir(), 'plugins.js.template'),
      #   File.join(titanium_folder, 'plugins.js'))
		
      Dir[File.join(Titanium.get_component_dir(), "**", "*.js")].each do |jsfile|
			  FileUtils.cp jsfile, titanium_folder
		  end
      
      Titanium.each_plugin do |plugin|
        plugin.install(@@project, @@dest, @@executable_name)
      end
		
		  if is_cygwin?
			  FileUtils.chmod 0755, File.join(app_folder, @@executable_name+".exe")
		  end
	
		  puts "#{@@executable_name}.exe created in #{app_folder}"
    end
    
    def Bundler.launch_win_exe
      system File.join(File.join(@@dest, @@executable_name), @@executable_name+".exe")
    end

    def Bundler.create_linux_dist
    end
    
    def Bundler.bundle_app(path, executable_name, dest, endpoint, launch, xml)
      @@path = path
      @@project = nil
      
      if Project.is_project_dir?(path)
        @@project = Project.load(path)
      end
      
      @@executable_name = executable_name
      @@dest = dest
      @@endpoint = endpoint
      @@xml = xml
      
      if is_mac?
        Bundler.create_osx_app()
        Bundler.launch_osx_app() if launch
      elsif is_win?
        Bundler.create_win_exe()
		    Bundler.launch_win_exe() if launch
      else
        Bundler.create_linux_dist()
      end
    end
  end
end
