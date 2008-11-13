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
  class Packager
    def Packager.copy_template(template_file, dest)
      contents = ''
      File.open(template_file, "r") { |f| contents = f.read }

      f_binding = binding
      template = ERB.new contents
      File.open(dest, 'w') { |f| f.write(template.result(f_binding)) }
    end
    
    def Packager.create_osx_app
      # store these as class variables for now so we can access them in other functions
      app_folder = File.join(@@dest, @@executable_name + ".app")
      contents_folder = File.join(app_folder, 'Contents')
      macos_folder = File.join(contents_folder, 'MacOS')
      resources_folder = File.join(contents_folder, 'Resources')
      titanium_folder = File.join(resources_folder, 'public', 'titanium')
      osx_support_folder = File.join(Titanium.get_support_dir(), 'osx')

      FileUtils.mkdir_p [app_folder, contents_folder, macos_folder, resources_folder, titanium_folder]
      
      FileUtils.cp Titanium.get_executable(), File.join(macos_folder, @@executable_name)
      FileUtils.chmod 0755, File.join(macos_folder, @@executable_name)
      FileUtils.cp_r File.join(@@project.path, 'public'), resources_folder
      FileUtils.cp File.join(osx_support_folder, 'appcelerator.icns'), resources_folder
      
      Packager.copy_template(
        File.join(osx_support_folder, 'Info.plist.template'),
        File.join(contents_folder, 'Info.plist'))
      
      Packager.copy_template(
        File.join(Titanium.get_support_dir(), 'default_tiapp.xml.template'),
        File.join(resources_folder, 'tiapp.xml'))
      
      Packager.copy_template(
        File.join(Titanium.get_support_dir(), 'plugins.js.template'),
        File.join(titanium_folder, 'plugins.js'))
      
      Dir[File.join(Titanium.get_component_dir(), "**", "*.js")].each do |jsfile|
        FileUtils.cp jsfile, titanium_folder
      end
      
      FileUtils.cp_r File.join(Titanium.get_app_path(), 'Contents', 'Resources', "English.lproj"), resources_folder
      
      Titanium.each_plugin do |plugin|
        plugin.install(@@project, @@dest, @@executable_name)
      end
      
      puts "#{@@executable_name}.app created in #{@@dest}"
    end
    
    def Packager.launch_osx_app
      system File.join(File.join(@@dest, @@executable_name) + ".app", 'Contents', 'MacOS', @@executable_name)
    end
    
    def Packager.create_win_exe
		app_folder = File.join(@@dest, @@executable_name)

		resources_folder = File.join(app_folder, 'Resources')
		titanium_folder = File.join(resources_folder, 'public', 'titanium')
		FileUtils.mkdir_p [app_folder, resources_folder, titanium_folder]

		FileUtils.cp Titanium.get_executable(), File.join(app_folder, @@executable_name+".exe")

		FileUtils.cp_r File.join(@@project.path, 'public'), resources_folder
		Packager.copy_template(
        	File.join(Titanium.get_support_dir(), 'default_tiapp.xml.template'),
        	File.join(resources_folder, 'tiapp.xml'))
      
        Packager.copy_template(
        File.join(Titanium.get_support_dir(), 'plugins.js.template'),
        File.join(titanium_folder, 'plugins.js'))

		Titanium.each_plugin do |plugin|
			plugin.install(@@project, @@dest, @@executable_name)
		end
		
		if is_cygwin?
			FileUtils.chmod 0755, File.join(app_folder, @@executable_name+".exe")
		end
	
		puts "#{@@executable_name}.exe created in #{app_folder}"
    end
    
    def Packager.launch_win_exe
      system File.join(File.join(@@dest, @@executable_name), @@executable_name+".exe")
    end

    def Packager.create_linux_dist
    end
    
    def Packager.package_project(project, executable_name, dest, endpoint, launch)
      @@project = project
      @@executable_name = executable_name
      @@dest = dest
      @@endpoint = endpoint
      
      if is_mac?
        Packager.create_osx_app()
        Packager.launch_osx_app() if launch
      elsif is_win?
        Packager.create_win_exe()
		Packager.launch_win_exe() if launch
      else
        Packager.create_linux_dist()
      end
    end
  end
end
