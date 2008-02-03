require 'rake'
require 'fileutils'
require 'pathname'
require 'find'
require 'zip/zip'
require 'yaml'


# determine our build
RELEASE = ENV['release_version'] || '0.0.0'
tokens = RELEASE.split('.')
RELEASE_MAJOR = tokens[0]
RELEASE_MINOR = tokens[1]
RELEASE_PATCH = tokens.length > 2 ? tokens[2] : 0

VERBOSE = ENV['v'] || ENV['verbose']
COMPRESS = ENV['nomin'] ? false : true 
STAGE_DIR = File.expand_path 'stage'
BUILD_DIR = File.expand_path 'build'

desc 'default build which builds the kitchen sink'
task :default => [:clean,:web,:java,:ruby,:php,:python,:perl] do
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

desc 'build web files'
task :web => [:stage] do
  web_dir = "#{STAGE_DIR}/web"
  js_dir = "#{web_dir}/js"
  js_source = 'src/web/js'

  FileUtils.rm_r web_dir if File.exists?(web_dir)
  FileUtils.mkdir_p js_dir
  
  puts 'Compiling appcelerator-lite.js...' if VERBOSE
  jslite_prefiles = %w(core.js debug.js string.js object.js datetime.js config.js compiler.js dom.js cookie.js servicebroker.js)
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
  Find.find(js_source) do |path|
    if File.extname(path) == '.js'
      result = excluded_files.find{ |filename| path.include? filename }
      if not result or path.include? 'actions/core.js'
        p path
        append_file(path, jslite)
      end
    end
  end
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
    system("java -jar #{BUILD_DIR}/bin/yuicompressor-2.2.5.jar #{jsdebug} -o #{jsout}")
    system("ruby #{BUILD_DIR}/bin/compress.rb #{jsout} #{jstemp}")
    FileUtils.rm jsout
    append_file(BUILD_DIR+'/license_header.txt', jsout)
    append_file(jstemp, jsout)
    FileUtils.rm jstemp

    system("java -jar #{BUILD_DIR}/bin/yuicompressor-2.2.5.jar #{jslite} -o #{jstemp}")
    system("ruby #{BUILD_DIR}/bin/compress.rb #{jstemp} #{jslite}")
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
    zipfile.mkdir('images')
    Find.find('src/web/images') do |path|
      pathname = Pathname.new(path)
      if not path.include? '.svn' and pathname.file?
        zipfile.add('images/'+pathname.basename,path)
      end
    end
    zipfile.mkdir('swf')
    Find.find('src/web/swf') do |path|
      pathname = Pathname.new(path)
      if not path.include? '.svn' and pathname.file?
        zipfile.add('swf/'+pathname.basename,path)
      end
    end
  end
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
  	system('rake clean gem')
  end  
  
  puts "Archiving Ruby files..." if VERBOSE
  Zip::ZipFile.open(ruby_dir+'/ruby.zip', Zip::ZipFile::CREATE) do |zipfile|
    zipfile.add('appcelerator.gem',gem_dir+'/pkg/appcelerator-'+RELEASE+'.gem')
	 Dir["#{ruby_dir}/**/**"].delete_if {|f| f=~/\.gem$/ or f=~/gem/ }.each do |file|
      fn = file.gsub("#{ruby_dir}/",'')
		zipfile.add(fn,file) unless File.directory?(file)
    end
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
    system "python setup.py bdist_egg"
  end
  puts "Archiving Python files..." if VERBOSE
  Zip::ZipFile.open(python_dir+'/python.zip', Zip::ZipFile::CREATE) do |zipfile|
    zipfile.add('install.rb',BUILD_DIR+'/installer/build/python/install.rb')
    zipfile.add('appcelerator.egg',"#{STAGE_DIR}/python/dist/Appcelerator-#{RELEASE}-py2.5.egg")
  end
end

desc 'build perl package'
task :perl => [:stage] do
  perl_dir = "#{STAGE_DIR}/perl"
  perl_src = 'src/perl'
end

desc 'build java package'
task :java => [:stage] do
  java_dir = "#{STAGE_DIR}/java"
  java_classes = "#{java_dir}/classes"
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

  puts "Compiling Java files..." if VERBOSE
  
  params = {
   'source'=>java_source,
   'dest'=>java_classes,
   'classes'=>java_classes,
   'jar'=>"appcelerator.jar",
   'lib'=>"#{BUILD_DIR}/java/lib",
   'zip'=>"#{java_dir}/java.zip",
   'dist'=>"#{java_dir}/dist"
  }.inject([]) {|a,e| a << "-D#{e[0]}=#{e[1]}" }
 
  system "ant -f simple.xml #{params.join(' ')}"
end

def clean_dir(dir)
  FileUtils.rm_r dir if File.exists?(dir)
  FileUtils.mkdir_p dir
end

def copy_dir(src, dest)
  Find.find(src) do |path|
    pathname = Pathname.new(path)
    if not path.include? '.svn' and pathname.file?
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
