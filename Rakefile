require 'rake'
require 'fileutils'
require 'pathname'
require 'find'
require 'zip/zip'

VERBOSE = ENV['v'] || ENV['verbose']
COMPRESS = ENV['min']
STAGE_DIR = 'stage'
BUILD_DIR = 'build'

desc 'prepare stage dir'
task :stage do
  if not Pathname.new(STAGE_DIR).exist?
    FileUtils.mkdir STAGE_DIR
  end
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
  if Pathname.new(web_dir).exist?
    FileUtils.rm_r web_dir
  end
  FileUtils.mkdir_p js_dir
  
  if VERBOSE
    puts 'Compiling appcelerator-lite.js...'
  end
  jslite_prefiles = ['bootstrap.js', 'core.js', 'debug.js', 'string.js', 'object.js', 'datetime.js', 'config.js', 'compiler.js', 'dom.js', 'cookie.js', 'servicebroker.js']
  jslite = js_dir+'/appcelerator-lite.js'
  append_file(BUILD_DIR+'/license_header.txt', jslite)
  jslite_prefiles.each do |file|
    append_file(js_source+'/'+file, jslite)
  end
  Find.find(js_source) do |path|
    if File.extname(path) == '.js'
      result = jslite_prefiles.find_all{ |i| path.include? i }.first
      if not result and not path.include? 'prolog.js'
        append_file(path, jslite)
      end
    end
  end
  
  if VERBOSE
    puts 'Compiling appcelerator-debug.js...'
  end
  jsdebug = js_dir+'/appcelerator-debug.js'
  append_file(BUILD_DIR+'/license_header.txt', jsdebug)
  append_file("\n/* The following files are subject to license agreements by their respective license owners */\n", jsdebug, true)
  append_file(js_source+'/prolog.js', jsdebug)
  thirdparty = ['prototype/prototype.js', 'scriptaculous/scriptaculous.js', 'scriptaculous/effects.js', 'scriptaculous/dragdrop.js', 'scriptaculous/resizable.js']
  thirdparty.each do |file|
    append_file(BUILD_DIR+'/web/'+file, jsdebug)
  end
  append_file("\n/* END THIRD PARTY SOURCE */\n", jsdebug, true)
  append_file(jslite, jsdebug)

  if VERBOSE
    puts 'Compiling appcelerator.js...'
  end
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
  
  if VERBOSE
    puts "Archiving JS files..."
  end
  Zip::ZipFile.open(web_dir+'/js.zip', Zip::ZipFile::CREATE) do |zipfile|
    zipfile.add('appcelerator-lite.js',jslite)
    zipfile.add('appcelerator-debug.js',jsdebug)
    zipfile.add('appcelerator.js',jsout)
  end

  if VERBOSE
    puts "Archiving Images..."
  end
  Zip::ZipFile.open(web_dir+'/images.zip', Zip::ZipFile::CREATE) do |zipfile|
    zipfile.mkdir('images')
    Find.find('src/web/images') do |path|
      pathname = Pathname.new(path)
      if not path.include? '.svn' and pathname.file?
        zipfile.add('images/'+pathname.basename,path)
      end
    end
  end

  if VERBOSE
    puts "Archiving SWF..."
  end
  Zip::ZipFile.open(web_dir+'/swf.zip', Zip::ZipFile::CREATE) do |zipfile|
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
  js_source = 'src/web/js'

  if Pathname.new(ruby_dir).exist?
    FileUtils.rm_r ruby_dir
  end
  FileUtils.mkdir_p gem_dir

  if VERBOSE
    puts "Copying Ruby files..."
  end
  copy_dir(ruby_source, gem_dir)
  
  rubyfiles = Array.new
  Find.find(gem_dir) do |path|
    pathname = Pathname.new(path)
    if not path.include? '.svn' and pathname.file?
      filename = pathname.relative_path_from(Pathname.new(gem_dir)).to_s
      rubyfiles.push(filename)
    end
  end

  manifest = File.open(gem_dir+'/Manifest.txt', 'w')
  rubyfiles.each do |f|
    manifest.write(f+"\n")
  end
  manifest.close

  if VERBOSE
    puts "Archiving Ruby files..."
  end
  Zip::ZipFile.open(ruby_dir+'/ruby.zip', Zip::ZipFile::CREATE) do |zipfile|
    rubyfiles.each do |f|
      zipfile.add(f,gem_dir+'/'+f)
    end
  end
  
  if VERBOSE
    puts "Making gem file for development..."
  end
  FileUtils.chdir(gem_dir)
  system('rake clean gem')
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

def append_file(from, to, string_input = false)
  if not string_input
    content = File.read(from)
  else
    content = from
  end
  file = File.open(to, 'a')
  file.write(content)
  file.close
end