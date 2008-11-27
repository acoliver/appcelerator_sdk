#
# This file is part of Appcelerator.
#
# Copyright 2006-2008 Appcelerator, Inc.
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#

namespace :runtime do

  task :all=> [:win32, :unix, :osx, :update] do
    FileUtils.rm_rf "#{STAGE_DIR}/installer"
  end

  desc 'build runtime update patch file'
  task :update do
    puts "==> Building Runtime Update Patch"

    config = get_config(:runtime, :update)
    update_dir = "#{STAGE_DIR}/installer-update"
    clean_dir(update_dir)
  
    FileUtils.mkdir_p update_dir
  
    copy_dir "#{RUNTIME_DIR}/src/cmdline", update_dir 
    FileUtils.mkdir_p("#{update_dir}/lib")
    FileUtils.cp "#{SERVICES_DIR}/common/ruby/agent/uuid.rb", "#{update_dir}/lib/uuid.rb"

    search_and_replace_in_file("#{update_dir}/console.rb","__VERSION__", CONFIG[:version])
  
    zipfile = config[:output_filename]
    FileUtils.rm_rf zipfile
  
    Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
      Dir["#{update_dir}/**/**"].each do |f|
        name = f.gsub(update_dir+'/','')
        zipfile.add name,f
      end
      zipfile.add 'pre_flight.rb',"#{RUNTIME_DIR}/pre_flight.rb"
    end

    add_config_to_zip(config)
  end
  
  desc 'build win32 installer'
  task :win32 do

    if not system "makensis -VERSION"
      STDERR.puts "Cannot build Win32 installers -- couldn't find `makensis` in your path ... Skipping..."
    else
      puts "==> Building Win32 Installers"
      config = get_config(:runtime, :win32)
      version = config[:version]

      win32_dir = "#{STAGE_DIR}/installer/win32"
      clean_dir(win32_dir)
      FileUtils.mkdir_p win32_dir
      
      copy_dir "#{RUNTIME_DIR}/src/cmdline", win32_dir
      copy_dir "#{RUNTIME_DIR}/src/titanium", win32_dir
      copy_dir "#{RUNTIME_DIR}/src/installer/win32", win32_dir
      FileUtils.mkdir_p("#{win32_dir}/lib")
      FileUtils.cp "#{SERVICES_DIR}/common/ruby/agent/uuid.rb", "#{win32_dir}/lib/uuid.rb"
  
      FileUtils.cp_r "#{ROOT_DIR}/LICENSE", win32_dir
  
      search_and_replace_in_file("#{win32_dir}/console.rb","__VERSION__", CONFIG[:version])

      # NSIS requires 0.0.0.0
      win32_version = "#{version}.#{Time.now.strftime '%m%d%y'}"

      build_yaml = File.join(win32_dir,'build.yml')
      dump_yaml(config, build_yaml)    
  
      FileUtils.cd(win32_dir) do
        call_command "makensis -DVERSION=\"#{win32_version}\" installer.nsi" if VERBOSE
        call_command "makensis -DVERSION=\"#{win32_version}\" -Oinstaller.log installer.nsi" unless VERBOSE
        FileUtils.cp_r "installer.exe", "#{STAGE_DIR}/installer_win32_#{version}.exe"

        call_command "makensis -DVERSION=\"#{win32_version}\" installer_titanium.nsi" if VERBOSE
        call_command "makensis -DVERSION=\"#{win32_version}\" -Oinstaller_titanium.log installer_titanium.nsi" unless VERBOSE
        FileUtils.cp_r "installer_titanium.exe", "#{STAGE_DIR}/installer_titanium_win32_#{version}.exe"
      end
  
      FileUtils.rm_rf "#{STAGE_DIR}/installer_win32_#{version}.zip" 
      Zip::ZipFile.open("#{STAGE_DIR}/installer_win32_#{version}.zip", Zip::ZipFile::CREATE) do |zipfile|
        zipfile.add "installer_win32_#{version}.exe","#{STAGE_DIR}/installer_win32_#{version}.exe"
        zipfile.add("build.yml", build_yaml)
      end

      FileUtils.rm_rf "#{STAGE_DIR}/installer_titanium_win32_#{version}.zip" 
      Zip::ZipFile.open("#{STAGE_DIR}/installer_titanium_win32_#{version}.zip", Zip::ZipFile::CREATE) do |zipfile|
        zipfile.add "installer_titanium_win32_#{version}.exe","#{STAGE_DIR}/installer_titanium_win32_#{version}.exe"
        zipfile.add("build.yml", build_yaml)
      end
  
      FileUtils.rm_rf win32_dir
      puts "Win32 Installers are now ready"
    end
  end

  desc 'build unix installer'
  task :unix do
    if is_win32
      STDERR.puts "Cannot compile unix on win32 based systems .... Will skip."
    else
      puts "==> Building Unix Installer"
      config = get_config(:runtime, :win32)
      version = config[:version]
  
      unix_dir = "#{STAGE_DIR}/installer/unix"
      clean_dir(unix_dir)
      FileUtils.mkdir_p unix_dir 
  
      copy_dir "#{RUNTIME_DIR}/src/cmdline", unix_dir 
      copy_dir "#{RUNTIME_DIR}/src/titanium", unix_dir
      copy_dir "#{RUNTIME_DIR}/src/installer/unix", unix_dir 
      FileUtils.cp "#{SERVICES_DIR}/common/ruby/agent/uuid.rb", "#{unix_dir}/lib/uuid.rb"
  
      FileUtils.rm_rf "#{unix_dir}/maker"
      FileUtils.rm_rf "#{unix_dir}/releases" if File.exists? "#{unix_dir}/releases"
      FileUtils.cp_r "#{ROOT_DIR}/LICENSE", unix_dir

      build_yaml = File.join(unix_dir,'build.yml')
      dump_yaml(config, build_yaml)    
      
      FileUtils.chmod 0755, "#{unix_dir}/setup.sh"
      
      search_and_replace_in_file("#{unix_dir}/console.rb","__VERSION__", CONFIG[:version])
      search_and_replace_in_file("#{unix_dir}/appcelerator.lsm","__VERSION__", CONFIG[:version])
  
      system "#{RUNTIME_DIR}/src/installer/unix/maker/makeself.sh --copy --lsm \"#{unix_dir}/appcelerator.lsm\" #{unix_dir} installer.run \"Appcelerator Open Web Platform\" ./setup.sh"
      FileUtils.mv "installer.run","#{STAGE_DIR}/installer_unix_#{version}.run"
  
      FileUtils.rm_rf "#{STAGE_DIR}/installer_unix_#{version}.zip" 
      Zip::ZipFile.open("#{STAGE_DIR}/installer_unix_#{version}.zip", Zip::ZipFile::CREATE) do |zipfile|
        zipfile.add "installer_unix_#{version}.run","#{STAGE_DIR}/installer_unix_#{version}.run"
        zipfile.add("build.yml", build_yaml)
      end
  
      #FileUtils.rm_rf unix_dir
      puts "Unix Installer is now ready"
    end
  end

  desc 'build osx installer'
  task :osx do
    if not RUBY_PLATFORM =~ /darwin/
      STDERR.puts "Cannot compile Mac OSX installer on non-darwin based systems .... Will skip."
    else
      puts "==> Building Mac OSX Installers"
      config = get_config(:runtime, :osx)
      version = config[:version]
      
      def makeit(config,version,name,build,readme,url)
        osx_dir = "#{STAGE_DIR}/installer#{build}/osx"

        clean_dir(osx_dir)
        FileUtils.mkdir_p osx_dir 
        FileUtils.mkdir_p "#{osx_dir}/installer#{build}/build/osx"

        copy_dir "#{RUNTIME_DIR}/src/cmdline", "#{osx_dir}/installer#{build}"
        copy_dir "#{RUNTIME_DIR}/src/titanium", "#{osx_dir}/installer#{build}"
        copy_dir "#{RUNTIME_DIR}/src/installer/osx", "#{osx_dir}/installer#{build}/build/osx"
        FileUtils.mkdir_p("#{osx_dir}/lib")
        FileUtils.cp "#{SERVICES_DIR}/common/ruby/agent/uuid.rb", "#{osx_dir}/lib/uuid.rb"

        search_and_replace_in_file("#{osx_dir}/installer#{build}/console.rb","__VERSION__", CONFIG[:version])

        # dynamically make our list of files into the pmdoc before we build
        make_pkg_file "#{osx_dir}/installer#{build}/build/osx/installer#{build}.pmdoc/05commands-contents.xml","#{osx_dir}/installer/commands"
        make_pkg_file "#{osx_dir}/installer#{build}/build/osx/installer#{build}.pmdoc/06lib-contents.xml","#{osx_dir}/installer/lib"

        fix_paths "#{osx_dir}/installer#{build}/build/osx/installer#{build}.pmdoc","#{osx_dir}/installer/build/osx"

        index = File.read "#{osx_dir}/installer#{build}/build/osx/installer#{build}.pmdoc/index.xml"

        file = File.open "#{osx_dir}/installer#{build}/build/osx/installer#{build}.pmdoc/index.xml",'w+'
        file.puts index.gsub(/<build>(.*?)<\/build>/,"<build>#{osx_dir}/installer#{build}/installer.mpkg</build>")
        file.close

        Dir["#{osx_dir}/installer#{build}/build/osx/installer#{build}.pmdoc/**/*.xml"].each do |file|
          f = File.open(file,'r+')
          c = f.read
          f.rewind
          c.gsub!(/ o="(.*?)"/," o=\"root\"")
          c.gsub!(/ g="(.*?)"/," g=\"admin\"")
          f.puts c
          f.close
        end

        system "hdiutil eject /Volumes/#{name} 2>/dev/null"

        FileUtils.chmod 0755, "#{osx_dir}/installer#{build}/appcelerator"
        
        build_yaml = File.join(osx_dir,"installer#{build}",'build.yml')
        dump_yaml(config, build_yaml)

        # build the package structure
        if File.exists? "/Developer/Tools/packagemaker"
          STDERR.puts "ERROR: Cannot build Mac OSX Installer using xcode version < 3.0. Please upgrade to the latest xcode."
          exit 1
        elsif File.exists? "/Developer/usr/bin/packagemaker"
          system "/Developer/usr/bin/packagemaker --target 10.4 --doc #{osx_dir}/installer#{build}/build/osx/installer#{build}.pmdoc --out #{osx_dir}/installer#{build}/#{name}.mpkg"
        else
          STDERR.puts "ERROR: Couldn't find xcode packagemaker"
          exit 1
        end

        # more details on how to do what we're doing are at:
        # http://digital-sushi.org/entry/how-to-create-a-disk-image-installer-for-apple-mac-os-x/

        # add in our postflight install script
        postflight = File.open "#{osx_dir}/installer#{build}/#{name}.mpkg/Contents/Packages/appcelerator.pkg/Contents/Resources/postflight",'w+'
        postflight.puts "#!/bin/sh"
        postflight.puts "/usr/bin/appcelerator '--postflight--' '#{url}'"
        postflight.puts "exit 0"
        postflight.close
        FileUtils.chmod 0755, "#{osx_dir}/installer#{build}/#{name}.mpkg/Contents/Packages/appcelerator.pkg/Contents/Resources/postflight"

        FileUtils.mkdir_p "#{osx_dir}/installer#{build}/build/osx/installer"
        system "hdiutil convert #{osx_dir}/installer#{build}/build/osx/#{name}.dmg -format UDSP -o #{osx_dir}/installer#{build}/build/osx/installer/#{name}"
        system "hdiutil mount #{osx_dir}/installer#{build}/build/osx/installer/#{name}.sparseimage"

        FileUtils.cp_r "#{osx_dir}/installer#{build}/#{name}.mpkg/Contents", "/Volumes/#{name}/Run Installer.mpkg"
        FileUtils.cp_r "#{osx_dir}/installer#{build}/build/osx/README#{build}", "/Volumes/#{name}/Read Me.txt" if readme
        system "hdiutil eject /Volumes/#{name}"
        system "hdiutil convert #{osx_dir}/installer#{build}/build/osx/installer/#{name}.sparseimage -format UDBZ -o #{osx_dir}/#{name}.dmg"

        FileUtils.rm_r "#{STAGE_DIR}/installer#{build}_osx_#{version}.dmg" rescue nil
        system "hdiutil convert -format UDZO -imagekey zlib-level=9 -o #{STAGE_DIR}/installer#{build}_osx_#{version}.dmg #{osx_dir}/#{name}.dmg"

        FileUtils.rm_rf "#{STAGE_DIR}/installer#{build}_osx_#{version}.zip" 
        Zip::ZipFile.open("#{STAGE_DIR}/installer#{build}_osx_#{version}.zip", Zip::ZipFile::CREATE) do |zipfile|
          zipfile.add "installer_osx_#{version}.dmg","#{STAGE_DIR}/installer#{build}_osx_#{version}.dmg"
          zipfile.add("build.yml", build_yaml)
        end

        FileUtils.rm_rf osx_dir
      end
      
      makeit(config,version,'Appcelerator','',true,'http://appcelerator.org/gettingstarted')
      makeit(config,version,'Titanium','_titanium',false,'http://titaniumapp.com/gettingstarted')

      puts "Mac OSX Installers are now ready"
    end
    
  end
end

#
# make a package file xml based on listing of files in directory
#
def build_pkg_contents(dir,indent=0)
  files = []
  files << " " * indent + "<f n=\"#{File.basename(dir)}\" o=\"root\" g=\"admin\" p=\"33188\">"
  Dir["#{dir}/*"].each do |path|
    pathname = Pathname.new(path)
    if not path.include? '.svn'
      if pathname.file?
        filename = pathname.relative_path_from(Pathname.new(dir))
        files << " " * (indent + 3) + "<f n=\"#{filename}\" o=\"root\" g=\"admin\" p=\"33188\"/>"
      elsif pathname.directory?
        files.concat build_pkg_contents(pathname.to_s,indent+3)
      end
    end
  end
  files << " " * indent + "</f>"
  files
end

def make_pkg_file(file,dir)
   f = File.open file,'w+'
   f.puts "<?xml version=\"1.0\"?>"
   f.puts "<pkg-contents spec=\"1.12\">"
   if dir.kind_of? Array
		dir.each do |dir|
			f.puts build_pkg_contents(dir)
   	end
   elsif dir.kind_of? String
   	f.puts build_pkg_contents(dir) 
   end
   f.puts "</pkg-contents>"
   f.close
end

def search_and_replace_in_file(file, to_find, to_replace)
  content = File.read(file).gsub!(to_find, to_replace)
  f = File.open(file,'w+')
  f.puts(content)
  f.flush()
  f.close()
  true
end

def fix_paths(dir,path)
  Dir["#{dir}/*-contents.xml"].each do |f|
    c = File.read(f)
    c.gsub!('/Users/jhaynie/Documents/workspace/appcelerator_sdk/build/installer',path)
    nf = File.open(f,'w+')
    nf.puts c
    nf.close
  end
end

def dump_yaml(config, filename)
  f = File.open(filename,'w')
  f.puts(config.to_yaml)
  f.flush
  f.close
end
