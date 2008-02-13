# This file is part of Appcelerator.
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# Appcelerator is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
require 'rake'
require 'fileutils'
require 'pathname'
require 'find'
require 'zip/zip'
require 'yaml'
require 'digest/md5'

# determine our build
RELEASE = ENV['release_version'] || '1.0.0'
tokens = RELEASE.split('.')
RELEASE_MAJOR = tokens[0]
RELEASE_MINOR = tokens[1]
RELEASE_PATCH = tokens.length > 2 ? tokens[2] : 0
version_config = {:version=>RELEASE}

VERBOSE = ENV['v'] || ENV['verbose'] || ENV['VERBOSE']
COMPRESS = ENV['nomin'] ? false : true 
STAGE_DIR = File.expand_path 'stage'
BUILD_DIR = File.expand_path 'build'

desc 'default build which builds the kitchen sink'
task :default => [:clean,"web:sdk","service:all","installer:all"] do
  puts "Complete!"
end

desc 'prepare stage dir'
task :stage do
  FileUtils.mkdir STAGE_DIR unless File.exists?(STAGE_DIR)
end

desc 'cleans stage dir'
task :clean do
  if Pathname.new(STAGE_DIR).exist?
    FileUtils.rm_r STAGE_DIR
  end
end

namespace :web do

  desc 'build websdk files'
  task :sdk => [:stage] do
    web_dir = "#{STAGE_DIR}/web"
    js_dir = "#{web_dir}/js"
    js_source = 'src/web/js'

    FileUtils.rm_r web_dir if File.exists?(web_dir)
    FileUtils.mkdir_p js_dir
  
    puts 'Compiling appcelerator-lite.js...' if VERBOSE
    jslite_prefiles = %w(core.js debug.js string.js object.js datetime.js config.js compiler.js dom.js cookie.js servicebroker.js localization.js)
    jslite = js_dir+'/appcelerator-lite.js'
    append_file(BUILD_DIR+'/license_header.txt', jslite)


    # fix the release information in the file
    bf = File.read(js_source+'/bootstrap.js')
    bf.gsub!('${version.major}',RELEASE_MAJOR.to_s)
    bf.gsub!('${version.minor}',RELEASE_MINOR.to_s)
    bf.gsub!('${version.rev}',RELEASE_PATCH.to_s)
    append_file(bf,jslite,true)

    jslite_prefiles.each do |file|
      append_file(js_source+'/'+file, jslite)
    end
  
    excluded_files = jslite_prefiles + %w(bootstrap.js prolog.js epilog.js)
    jsfiles = []

    Dir["#{js_source}/*.js"].sort {|a,b| a<=>b }.each do |path|
        result = excluded_files.find{ |filename| path.include? filename }
      if not result
        jsfiles << path
      end
    end
 
    %w(conditions processors actions).each do |dir|
      Dir["#{js_source}/#{dir}/*.js"].sort {|a,b| a<=>b }.each do |path|
      jsfiles << path
      end
    end

    jsfiles.each {|path| append_file(path, jslite) }
    append_file("#{js_source}/epilog.js", jslite)

    puts 'Compiling appcelerator-debug.js...' if VERBOSE
    jsdebug = js_dir+'/appcelerator-debug.js'
    append_file(BUILD_DIR+'/license_header.txt', jsdebug)
    append_file("\n/* The following files are subject to license agreements by their respective license owners */\n", jsdebug, true)
    append_file(js_source+'/prolog.js', jsdebug)
    thirdparty = %w(prototype/prototype.js scriptaculous/scriptaculous.js scriptaculous/effects.js scriptaculous/dragdrop.js scriptaculous/resizable.js)
    thirdparty.each do |file|
      append_file(BUILD_DIR+'/web/'+file, jsdebug)
    end
    append_file("\n/* END THIRD PARTY SOURCE */\n", jsdebug, true)
    append_file(jslite, jsdebug)

    puts 'Compiling appcelerator.js...' if VERBOSE
    jsout = js_dir+'/appcelerator.js'
    jstemp = js_dir+'/appcelerator-temp.js'
    if not COMPRESS
      FileUtils.copy(jsdebug,jsout)
    else
      system("java -jar #{BUILD_DIR}/bin/yuicompressor-2.2.5.jar #{jsdebug} -o #{jsout} >/dev/null 2>&1")
      system("ruby #{BUILD_DIR}/bin/compress.rb #{jsout} #{jstemp} >/dev/null 2>&1")
      FileUtils.rm jsout
      append_file(BUILD_DIR+'/license_header.txt', jsout)
      append_file(jstemp, jsout)
      FileUtils.rm jstemp

      system("java -jar #{BUILD_DIR}/bin/yuicompressor-2.2.5.jar #{jslite} -o #{jstemp} >/dev/null 2>&1")
      system("ruby #{BUILD_DIR}/bin/compress.rb #{jstemp} #{jslite} >/dev/null 2>&1")
      FileUtils.rm jstemp
      append_file(BUILD_DIR+'/license_header.txt', jstemp)
      append_file(jslite, jstemp)
      FileUtils.rm jslite
      append_file(jstemp, jslite)
      FileUtils.rm jstemp
    end
  
    puts "Archiving JS/Web files..." if VERBOSE
    Zip::ZipFile.open(web_dir+'/web.zip', Zip::ZipFile::CREATE) do |zipfile|
      zipfile.add('js/appcelerator-lite.js',jslite)
      zipfile.add('js/appcelerator-debug.js',jsdebug)
      zipfile.add('js/appcelerator.js',jsout)
      zipfile.get_output_stream('build.yml') {|f| version_config[:name]='web'; f.puts version_config.to_yaml }
      Find.find('src/web') do |path|
        pathname = Pathname.new(path)
      next if path =~ /^src\/web\/modules/ and not path =~ /^src\/web\/modules\/common/
        if not path.include? '.svn' and not path.include? '.DS_Store' and pathname.file?
          filename = pathname.relative_path_from(Pathname.new('src/web')).to_s
          zipfile.add(filename,'src/web/'+filename) if not filename =~ /^js(.*)\.js$/
        end
      end
    end
  end

end

namespace :widget do
  
  desc 'build widget zip'
  task :widget => [:stage] do
    widget_real_name = ENV['name']
    widget_name = widget_real_name.gsub ':','_' 
    widget_source = "src/web/modules/#{widget_name}"
    widget_dir = "#{STAGE_DIR}/widgets/#{widget_name}"

    if not File.exists?(widget_source)
      puts "Could not find widget source files in #{widget_source}"
      return
    end

    puts "Building widget #{widget_real_name}..." if VERBOSE
  
    FileUtils.rm_r widget_dir if File.exists?(widget_dir)
    FileUtils.mkdir_p widget_dir
    FileUtils.cp_r "#{widget_source}", "#{STAGE_DIR}/widgets"
  
    if COMPRESS
     system("ruby #{BUILD_DIR}/bin/modules.rb #{STAGE_DIR}/widgets #{STAGE_DIR}/widgets #{BUILD_DIR}/bin/yuicompressor-2.2.5.jar >/dev/null 2>&1")
    end

    puts "Archiving module files..." if VERBOSE
    FileUtils.rm_r "#{STAGE_DIR}/widgets/#{widget_name}.zip" if File.exists? "#{STAGE_DIR}/widgets/#{widget_name}.zip"
    Zip::ZipFile.open("#{STAGE_DIR}/widgets/#{widget_name}.zip", Zip::ZipFile::CREATE) do |zipfile|
      Find.find(widget_dir) do |path|
        pathname = Pathname.new(path)
        if not path.include? '.svn' and not path.include? '.DS_Store' and pathname.file?
          filename = pathname.relative_path_from(Pathname.new(widget_dir)).to_s
          zipfile.add(filename,"#{widget_dir}/#{filename}")
        end
      end
      zipfile.get_output_stream('build.yml') {|f| version_config[:name]=widget_real_name; f.puts version_config.to_yaml }
    end
  end

  desc 'build a combined set of widgets'
  task :all => ["service:java"]  do

    srcdir = 'src/web/modules'
    dest = "#{STAGE_DIR}/widgets"
    sep = RUBY_PLATFORM=~/win32/ ? ';' : ':'

    FileUtils.rm_r dest if File.exists?(dest)
    FileUtils.mkdir_p dest
    copy_dir srcdir,dest
    cp = Dir["#{STAGE_DIR}/java/dist/lib/**/*.jar"].join(sep)

    cmd = "java -cp #{cp} org.appcelerator.compiler.compressor.Compressor src/web/modules #{STAGE_DIR}/widgets true"

    puts cmd if VERBOSE

    system cmd

    zips = []

    Dir["#{STAGE_DIR}/widgets/*"].each do |dir|
      name = File.basename(dir)
      next if name == 'common'
      zipfile = "#{STAGE_DIR}/widgets/#{name}.zip"
      zips << ["#{name}.zip",zipfile]
        Zip::ZipFile.open("#{STAGE_DIR}/widgets/#{name}.zip", Zip::ZipFile::CREATE) do |zipfile|
        dofiles("#{STAGE_DIR}/widgets/#{name}") do |f|
          filename = f.to_s
          if not filename == '.'
            zipfile.add(filename,"#{STAGE_DIR}/widgets/#{name}/#{filename}")
          end
        end
        zipfile.get_output_stream('build.yml') do |f|
          config = {:version=>1.0,:name=>name.gsub('app_','app:')}
          f.puts config.to_yaml
        end
      end
    end

    Zip::ZipFile.open("#{STAGE_DIR}/widgets/all_widgets.zip",Zip::ZipFile::CREATE) do |zipfile|
      zips.each do |z|
        zipfile.add(z[0],z[1])
      end
    end

  end
end

namespace :service do
  
  task :all => [:java,:ruby,:dotnet,:perl,:php,:python] do
  end
  
  desc 'build ruby package'
  task :ruby => [:stage] do
    ruby_dir = "#{STAGE_DIR}/ruby"
    gem_dir = "#{ruby_dir}/gem"
    ruby_source = 'src/ruby/gem-new'

    clean_dir(ruby_dir)
    FileUtils.mkdir_p gem_dir

    puts "Copying Ruby files..." if VERBOSE
    copy_dir(ruby_source, gem_dir)

    FileUtils.cp_r "build/installer/build/ruby/.", ruby_dir
  
    rubyfiles = Array.new
    dofiles(gem_dir) do |f|
      rubyfiles.push(f.to_s)
    end

    manifest = File.open(gem_dir+'/Manifest.txt', 'w')
    rubyfiles.each do |f|
      manifest.puts f 
    end
    manifest.close

    # fix the release information in the file
    insert_version_number("#{gem_dir}/lib/appcelerator.rb")

    puts "Making Ruby gem file..." if VERBOSE
    FileUtils.cd(gem_dir) do
      system('rake clean gem >/dev/null') unless VERBOSE
      system('rake clean gem') if VERBOSE
    end  
  
    puts "Archiving Ruby files..." if VERBOSE
    Zip::ZipFile.open(ruby_dir+'/ruby.zip', Zip::ZipFile::CREATE) do |zipfile|
      zipfile.add('appcelerator.gem',gem_dir+'/pkg/appcelerator-'+RELEASE+'.gem')
     Dir["#{ruby_dir}/**/**"].delete_if {|f| f=~/\.gem$/ or f=~/gem/ }.each do |file|
        fn = file.gsub("#{ruby_dir}/",'')
      zipfile.add(fn,file) unless File.directory?(file)
      end
      zipfile.get_output_stream('build.yml') {|f| version_config[:name]='ruby'; f.puts version_config.to_yaml }
    end
  end

  desc 'build php package'
  task :php => [:stage] do
    php_dir = "#{STAGE_DIR}/php"
    php_source = 'src/php'

    clean_dir(php_dir)
  
    puts "Archiving PHP files..." if VERBOSE
    Zip::ZipFile.open(php_dir+'/php.zip', Zip::ZipFile::CREATE) do |zipfile|
      Find.find(php_source) do |path|
        pathname = Pathname.new(path)
        if not path.include? '.svn' and pathname.file?
          filename = pathname.relative_path_from(Pathname.new(php_source)).to_s
          zipfile.add(filename,php_source+'/'+filename)
        end
      end
      zipfile.add('services/sample_service.php',BUILD_DIR+'/php/sample_service.php')
      zipfile.add('README',BUILD_DIR+'/php/README')
      zipfile.add('appcelerator.xml',BUILD_DIR+'/php/appcelerator.xml')
      zipfile.add('install.rb',BUILD_DIR+'/installer/build/php/install.rb')
      zipfile.get_output_stream('build.yml') {|f| version_config[:name]='php'; f.puts version_config.to_yaml }
    end
  end

  desc 'build python package'
  task :python => [:stage] do
    python_dir = "#{STAGE_DIR}/python"
    python_src = 'src/python'
  
    clean_dir(python_dir)
    puts "Copying Python source files..." if VERBOSE
    copy_dir(python_src, python_dir)
    FileUtils.copy("#{BUILD_DIR}/python/README", python_dir)
  
    insert_version_number("#{python_dir}/setup.py")
  
    FileUtils.cd(python_dir) do
      puts "Building python egg..." if VERBOSE
      system "python setup.py bdist_egg" if VERBOSE
      system "python setup.py bdist_egg >/dev/null" unless VERBOSE
    end
    puts "Archiving Python files..." if VERBOSE
    Zip::ZipFile.open(python_dir+'/python.zip', Zip::ZipFile::CREATE) do |zipfile|
      zipfile.add('install.rb',BUILD_DIR+'/installer/build/python/install.rb')
      zipfile.add('appcelerator.egg',"#{STAGE_DIR}/python/dist/Appcelerator-#{RELEASE}-py2.5.egg")
      zipfile.get_output_stream('build.yml') {|f| version_config[:name]='python'; f.puts version_config.to_yaml }
    end
  end

  desc 'build perl package'
  task :perl => [:stage] do
    perl_dir = "#{STAGE_DIR}/perl"
    perl_src = 'src/perl'
    #FIXME
  end

  desc 'build dotnet package'
  task :dotnet => [:stage] do
    dotnet_dir = "#{STAGE_DIR}/dotnet"
    dotnet_src = 'src/dotnet'
    #FIXME
  end

  desc 'build java package'
  task :java => [:stage] do
    java_dir = "#{STAGE_DIR}/java"
    java_classes = File.expand_path "#{java_dir}/classes"
    java_source = 'src/java'

    clean_dir(java_dir)
    FileUtils.mkdir_p java_classes
    FileUtils.mkdir_p File.join(java_dir,'dist') rescue nil
    FileUtils.mkdir_p File.join(java_dir,'dist','lib') rescue nil
    FileUtils.mkdir_p File.join(java_dir,'dist','src','web','WEB-INF','classes') rescue nil
    FileUtils.mkdir_p File.join(java_dir,'dist','src','java') rescue nil

    copy_dir "#{BUILD_DIR}/java/lib", File.join(java_dir,'dist','lib')

    #TODO: move this
    FileUtils.copy("#{BUILD_DIR}/java/build.xml",File.join(java_dir,'dist'))
    FileUtils.copy("#{BUILD_DIR}/java/build.properties",File.join(java_dir,'dist'))
    FileUtils.copy("#{BUILD_DIR}/java/appcelerator.xml",File.join(java_dir,'dist','src','web'))
    FileUtils.copy("#{BUILD_DIR}/java/web.xml",File.join(java_dir,'dist','src','web','WEB-INF'))
    FileUtils.copy("#{BUILD_DIR}/java/spring-beans.xml",File.join(java_dir,'dist','src','web','WEB-INF','classes'))
    FileUtils.copy("#{BUILD_DIR}/java/appcelerator.properties",File.join(java_dir,'dist','src','web','WEB-INF','classes'))
    FileUtils.copy("#{BUILD_DIR}/java/appcelerator.log4j.properties",File.join(java_dir,'dist','src','web','WEB-INF','classes'))
    FileUtils.copy("#{BUILD_DIR}/java/spring-beans.xml",File.join(java_dir,'dist','src','web','WEB-INF','classes'))
    FileUtils.copy("#{BUILD_DIR}/java/SampleService.java",File.join(java_dir,'dist','src','java'))
    FileUtils.copy("#{BUILD_DIR}/installer/build/java/install.rb",File.join(java_dir,'dist'))
    FileUtils.copy("#{BUILD_DIR}/installer/build/java/war.rb",File.join(java_dir,'dist'))

    puts "Compiling Java files..." if VERBOSE

    sep = RUBY_PLATFORM=~/win32/ ? ';' : ':'

    cp = Dir["#{BUILD_DIR}/java/lib/**/*.jar"].inject([]) {|a,f| a<<f }
    src = Dir["#{java_source}/**/*.java"].inject([]) {|a,f| a<<f }

    config = {:name=>'java',:version=>RELEASE}
    f = File.open "#{java_dir}/dist/build.yml", 'w+'
    f.puts config.to_yaml
    f.close

    FileUtils.mkdir_p "#{java_dir}/classes" unless File.exists? "#{java_dir}/classes"
    system "javac -cp #{cp.join(sep)} #{src.join(' ')} -target 1.5 -d #{java_dir}/classes"

    FileUtils.mkdir_p "#{java_dir}/dist/lib" unless File.exists? "#{java_dir}/dist/lib"
    FileUtils.cd(java_classes) do
      
       cl = []

       Find.find(java_classes) do |path|
        f = File.expand_path path
        next if File.directory?(f)
        fn = f.gsub(java_classes+'/','')
        cl << fn
       end
       
       system "jar cvf #{java_dir}/dist/lib/appcelerator.jar ." if VERBOSE
       system "jar cvf #{java_dir}/dist/lib/appcelerator.jar . >/dev/null" unless VERBOSE

       Zip::ZipFile.open("#{java_dir}/java.zip", Zip::ZipFile::CREATE) do |zipfile|
        dofiles("#{java_dir}/dist") do |f|
          filename = f.to_s
          if not filename == '.'
            zipfile.add(filename,"#{java_dir}/dist/#{filename}")
          end
        end
      end
    end

  end

end

namespace :installer do
  
  desc 'build all installers'
  task :all => [:win32,:osx,:unix] do
  end
  
  desc 'prepare for win32 installer'
  task :win32 => [:stage] do
    win32_dir = "#{STAGE_DIR}/win32"
    clean_dir(win32_dir)
    FileUtils.mkdir_p win32_dir 
    copy_dir "#{BUILD_DIR}/installer", win32_dir
    copy_dir "#{BUILD_DIR}/installer/build/win32", win32_dir
    FileUtils.rm_r "#{win32_dir}/build"
    FileUtils.rm_r "#{win32_dir}/releases" if File.exists? "#{win32_dir}/releases"
    FileUtils.cp_r "LICENSE", win32_dir
    FileUtils.cd(win32_dir) do
      system "makensis installer.nsi" if VERBOSE
      system "makensis -Oinstaller.log installer.nsi" unless VERBOSE
      md5_file "installer.exe"
    end

    puts "Win32 Installer is now ready"
  end

  desc 'build unix installer'
  task :unix=> [:stage] do
     unix_dir = "#{STAGE_DIR}/unix"
     clean_dir(unix_dir)
     FileUtils.mkdir_p unix_dir 
     copy_dir "#{BUILD_DIR}/installer",unix_dir 
     copy_dir "#{BUILD_DIR}/installer/build/unix/.",unix_dir 
     FileUtils.rm_r "#{unix_dir}/build"
     FileUtils.rm_r "#{unix_dir}/maker"
     FileUtils.rm_r "#{unix_dir}/appcelerator.lsm"
     FileUtils.rm_r "#{unix_dir}/releases" if File.exists? "#{unix_dir}/releases"
     FileUtils.cp_r "LICENSE", unix_dir
     FileUtils.chmod 0755, "#{unix_dir}/setup.sh"
     system "#{BUILD_DIR}/installer/build/unix/maker/makeself.sh --copy --lsm \"#{BUILD_DIR}/installer/build/unix/appcelerator.lsm\" #{unix_dir} installer.run \"Appcelerator RIA Platform\" ./setup.sh"
     FileUtils.mv "installer.run",unix_dir
     md5_file "#{unix_dir}/installer.run"

     puts "Unix is now ready"
  end

  desc 'build osx installer'
  task :osx=> [:stage] do
    osx_dir = "#{STAGE_DIR}/osx"
    name = "Appcelerator"

    clean_dir(osx_dir)
    FileUtils.mkdir_p osx_dir 

    FileUtils.rm_r "#{osx_dir}/installer" if File.exists? "#{osx_dir}/installer"

    copy_dir "#{BUILD_DIR}/installer", "#{osx_dir}/installer"

    # dynamically make our list of files into the pmdoc before we build
    make_pkg_file "#{osx_dir}/installer/build/osx/installer.pmdoc/05commands-contents.xml","#{osx_dir}/installer/commands"
    make_pkg_file "#{osx_dir}/installer/build/osx/installer.pmdoc/06lib-contents.xml","#{osx_dir}/installer/lib"

    index = File.read "#{osx_dir}/installer/build/osx/installer.pmdoc/index.xml"
   
    file = File.open "#{osx_dir}/installer/build/osx/installer.pmdoc/index.xml",'w+'
    file.puts index.gsub(/<build>(.*?)<\/build>/,"<build>#{osx_dir}/installer/installer.mpkg</build>")
    file.close
    
    Dir["#{osx_dir}/installer/build/osx/installer.pmdoc/**/*.xml"].each do |file|
      f = File.open(file,'r+')
      c = f.read
      f.rewind
      c.gsub!(/ o="(.*?)"/," o=\"root\"")
      c.gsub!(/ g="(.*?)"/," g=\"admin\"")
      f.puts c
      f.close
    end
    
    # build the package structure
    if File.exists? "/Developer/Tools/packagemaker"
    	system "/Developer/Tools/packagemaker --target 10.4 --doc #{osx_dir}/installer/build/osx/installer.pmdoc --out #{osx_dir}/installer/#{name}.mpkg"
    elsif File.exists? "/Developer/usr/bin/packagemaker"
    	system "/Developer/usr/bin/packagemaker --target 10.4 --doc #{osx_dir}/installer/build/osx/installer.pmdoc --out #{osx_dir}/installer/#{name}.mpkg"
    else
		STDERR.puts "Couldn't find XTools packagemaker"
      exit 1
    end

    # add in our postflight install script
    postflight = File.open "#{osx_dir}/installer/#{name}.mpkg/Contents/Packages/lib.pkg/Contents/Resources/postflight",'w+'
    postflight.puts "#!/bin/sh"
    postflight.puts "/usr/bin/appcelerator '--postflight--'"
    postflight.puts "exit 0"
    postflight.close
    FileUtils.chmod 0755, "#{osx_dir}/installer/#{name}.mpkg/Contents/Packages/lib.pkg/Contents/Resources/postflight"
    
    # create our DMG file
    system "hdiutil create -format UDZO -srcfolder #{osx_dir}/installer/#{name}.mpkg #{osx_dir}/#{name}_tmp.dmg"
    system "hdiutil convert -format UDZO -imagekey zlib-level=9 -o #{osx_dir}/#{name}.dmg #{osx_dir}/#{name}_tmp.dmg"
    md5_file "#{osx_dir}/#{name}.dmg"
    
    FileUtils.rm_r "#{osx_dir}/#{name}_tmp.dmg"
  end


  desc 'build installer update patch'
  task :patch => [:stage] do
    patch_dir = File.expand_path "#{STAGE_DIR}/update"
    clean_dir(patch_dir)
     FileUtils.mkdir_p patch_dir
     copy_dir "#{BUILD_DIR}/installer", patch_dir
     FileUtils.rm_r "#{patch_dir}/build"
     FileUtils.rm_r "#{patch_dir}/appcelerator"
     FileUtils.rm_r "#{patch_dir}/releases" if File.exists? "#{patch_dir}/releases"
     Zip::ZipFile.open(patch_dir+'/update.zip', Zip::ZipFile::CREATE) do |zipfile|
      dofiles(patch_dir) do |pathname|
        filename = pathname.to_s
           zipfile.add(filename,patch_dir+'/'+filename)
      end
        zipfile.get_output_stream('build.yml') {|f| version_config[:name]='installer'; f.puts version_config.to_yaml }
    end
  end
end

def clean_dir(dir)
  FileUtils.rm_r dir if File.exists?(dir)
  FileUtils.mkdir_p dir
end

#
# monkey patch to be able to call a task
# more than once
#
module Rake
  class Task
    def invokeAgain
      @already_invoked = false
      self.invoke
    end
  end
end



def copy_dir(src, dest)
  Find.find(src) do |path|
    pathname = Pathname.new(path)
    if not path.include? '.svn' and not path.include? '.DS_Store' and pathname.file?
      dirname = pathname.relative_path_from(Pathname.new(src)).dirname 
      FileUtils.mkdir_p(dest+'/'+dirname)
      FileUtils.copy(path, dest+'/'+dirname)
    end
  end
end

def insert_version_number(file)
  src = File.read file
  src.gsub!('0.0.0',RELEASE)
  src_out = File.open file,"w+"
  src_out.write src
  src_out.close
end

def append_file(from, to, is_string=false)
  file = File.open(to, 'a')
  file.write(is_string ? from : File.read(from))
  file.close
end

def dofiles(dir)
  Find.find(dir) do |path|
    pathname = Pathname.new(path)
    if not path.include? '.svn' and pathname.file?
      filename = pathname.relative_path_from(Pathname.new(dir))
      yield filename
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
  f.puts build_pkg_contents(dir) 
  f.puts "</pkg-contents>"
  f.close
end

def md5_file(file)
   md5 = Digest::MD5.hexdigest File.read(file)
   f = File.open "#{file}.md5", 'w+'
   f.puts md5
   f.close
end
