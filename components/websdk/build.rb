#
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
require 'tempfile'
require 'tmpdir'

WEBSDK_STAGE_DIR = File.join(STAGE_DIR, 'websdk')
JS_PATH = "javascripts"

namespace :websdk do

  build_config = get_config(:websdk, :websdk)

  task :all => [:test] do
  end
  
  desc 'build websdk files'
  task :default do
    js_dir = "#{WEBSDK_STAGE_DIR}/#{JS_PATH}" # staging location
    js_source = "#{WEBSDK_DIR}/src/js"
  
    #clean_dir(WEBSDK_STAGE_DIR)
    
    FileUtils.rm_rf js_dir
  
    FileUtils.mkdir_p js_dir unless File.exists?(js_dir)
  
    puts 'Compiling appcelerator-lite.js...' if VERBOSE
    # files that need to be included before the others in the directory
  
    jslite = js_dir+'/appcelerator-lite.js'
    FileUtils.rm_rf jslite if File.exists? jslite
  
    rel = build_config[:version].to_s.split('.')
    
    LICENSE_HEADER=<<END_LICENSE
  /*!(c) 2006-#{Time.now.strftime('%Y')} Appcelerator, Inc. http://appcelerator.org
   * Licensed under the Apache License, Version 2.0. Please visit
   * http://license.appcelerator.com for full copy of the License.
   * Version: #{build_config[:version]}, Released: #{Time.now.strftime('%m/%d/%Y')}
   **/
END_LICENSE
  
    compat_file = "#{js_dir}/appcelerator-compat.js"
    
    append_file(LICENSE_HEADER,compat_file,true)
    append_file("#{js_source}/compat.js", compat_file)
  
    
    # fix the release information in the file
    rel = build_config[:version].to_s.split('.')
   
    PREINCLUDES = ["#{js_source}/prolog.js","#{js_source}/lib/uri.js","#{js_source}/bootstrap.js","#{js_source}/lib/jquery.js", "#{js_source}/lib/types.js","#{js_source}/lib/action.js", "#{js_source}/lib/parser.js", "#{js_source}/lib/event.js", "#{js_source}/plugins/cookie.js","#{js_source}/plugins/trash.js"]
   
    jslite_prefiles = PREINCLUDES
    Dir["#{js_source}/lib/*.js"].each do |f|
      jslite_prefiles << f unless jslite_prefiles.include? f
    end
    jslite_prefiles.delete_if {|f| File.basename(f)=='action_adapters.js' }
  
    Dir["#{js_source}/plugins/*.js"].each do |f|
      jslite_prefiles << f unless jslite_prefiles.include? f
    end
    jslite_prefiles.delete_if {|f| f=~/_action\.js$/ or f=~/-patch\.js$/ or File.basename(f)=='tracker.js'}
    
    jslite_prefiles << "#{js_source}/lib/action_adapters.js"
    jslite_prefiles << "#{js_source}/lib/tracker.js"
    jslite_prefiles << "#{js_source}/epilog.js"
    
    puts jslite_prefiles.join("\n")
  
    jslite_prefiles.each do |file|
      append_file("\n/* #{File.basename(file)} */\n\n",jslite,true)
      append_file(file, jslite)
      append_file("\n//" + ("-"*80) + "\n",jslite,true)
    end
    
    bf = File.read(jslite)
    bf.gsub!('${version.major}',rel[0])
    bf.gsub!('${version.minor}',rel[1])
    bf.gsub!('${version.rev}',rel[2]||'0')
    bf.gsub!('${build.date}',Time.now.strftime('%m/%d/%Y'))
    f = File.open(jslite,'w')
    f.write bf
    f.close
    
    puts 'Compiling appcelerator-debug.js...' if VERBOSE
    
    jsdebug = js_dir+'/appcelerator-debug.js'
  
    FileUtils.rm_rf jsdebug
    
    append_file(LICENSE_HEADER, jsdebug, true)
  
    append_file("\n/*- The following file(s) are subject to license agreements by their respective license owners. Ends at text: END THIRD PARTY SOURCE */\n", jsdebug, true)
    thirdparty = ['jquery/jquery.js']
    thirdparty.each do |file|
      append_file("\nif (typeof(jQuery)=='undefined'){\n", jsdebug, true)
      append_file(WEBSDK_DIR+'/lib/'+file, jsdebug)
      append_file("\n}\n", jsdebug, true)
    end
    
    # patch jQuery
    puts "+ patching jQuery ... "
    j = File.read(jsdebug)
    patch = File.read(WEBSDK_DIR+'/src/js/jquery-patch.js')
    idx = j.index "// Handle HTML strings"  # this is the marker that we insert before (from jQuery)
    c = j[0,idx]
    c << patch
    c << j[idx..-1]
    jq = File.open(jsdebug,'w')
    jq.write c
    jq.close
    
    append_file("\n/* END THIRD PARTY SOURCE */\n", jsdebug, true)
    append_file(jslite, jsdebug)
    
    puts 'Compiling appcelerator.js...' if VERBOSE
    jsout = js_dir+'/appcelerator.js'
    jstemp = js_dir+'/appcelerator-temp.js'
  
    jscompat_debug = js_dir+'/appcelerator-compat-debug.js'
    jscompat = js_dir+'/appcelerator-compat.js'
    
    if COMPRESS
      puts "Compressing appcelerator.js"
  
      js = compress_and_mangle(jsdebug,File.read(jsdebug))
      f = File.open(jstemp,'w')
      f.write js
      f.close
  
      FileUtils.rm jsout if File.exists?(jsout)
      append_file(LICENSE_HEADER, jsout, true)
      append_file(jstemp, jsout)
  
      js = compress_and_mangle(jslite,File.read(jslite))
      f = File.open(jslite,'w')
      f.write js
      f.close
  
      FileUtils.rm jstemp if File.exists?(jstemp)
      append_file(LICENSE_HEADER, jstemp, true)
      append_file(jslite, jstemp)
      FileUtils.rm jslite
      append_file(jstemp, jslite)
      FileUtils.rm jstemp
  
  
      FileUtils.cp_r jscompat,jscompat_debug
  
      jscompt = jscompat+'.tmp'
      js = compress_and_mangle(jscompat,File.read(jscompat))
      f = File.open(jscompt,'w+')
      f.write js
      f.close
      
      FileUtils.rm_rf jscompat
      append_file(LICENSE_HEADER, jscompat, true)
      append_file(jscompt, jscompat)
      FileUtils.rm_rf jscompt
  
    else
      FileUtils.cp jsdebug, jsout
    end
  
    puts "Archiving JS/Web files..." if VERBOSE
    zipfile = "#{STAGE_DIR}/websdk_#{build_config[:version]}.zip"
    FileUtils.rm_rf zipfile if File.exists? zipfile
    Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
      zipfile.add("#{JS_PATH}/appcelerator-lite.js",jslite)
      zipfile.add("#{JS_PATH}/appcelerator-debug.js",jsdebug)
      zipfile.add("#{JS_PATH}/appcelerator-compat.js",jscompat)
      zipfile.add("#{JS_PATH}/appcelerator-compat-debug.js",jscompat_debug) if COMPRESS
      zipfile.add("#{JS_PATH}/appcelerator.js",jsout)
      zipfile.get_output_stream('build.yml') {|f| f.puts build_config.to_yaml }
      %w(control layout theme behavior).each do |type|
        Dir["#{STAGE_DIR}/#{type}*.zip"].each do |includefile|
          zipfile.add "_install/#{File.basename(includefile)}", includefile
        end
      end
      Find.find("#{WEBSDK_DIR}/src/web") do |path|
        pathname = Pathname.new(path)
        path_root = Pathname.new("#{WEBSDK_DIR}/src/web")
        if not path.include? '.svn' and not path.include? '.DS_Store' and pathname.file?
          filename = pathname.relative_path_from(path_root).to_s
          zipfile.add(filename,path) if not filename =~ /^js(.*)\.js$/
        end
      end
      Find.find("#{WEBSDK_DIR}/src/common") do |path|
        pathname = Pathname.new(path)
        path_root = Pathname.new("#{WEBSDK_DIR}/src/common")
        if not path.include? '.svn' and not path.include? '.DS_Store' and pathname.file?
          filename = pathname.relative_path_from(path_root).to_s
          zipfile.add('common/' + filename,path)
        end
      end
    end
  end
  
  task :test => [:default] do
    copy_tests("#{WEBSDK_DIR}/test/webunit", "#{STAGE_DIR}/webunit")
    copy_tests("#{WEBSDK_DIR}/test/appunit", "#{STAGE_DIR}/appunit")
    #copy_tests("#{WEBSDK_DIR}/test/performance", "#{STAGE_DIR}/performance")
  end
end
  
def copy_tests(test_src_path, test_dst_path)
  test_sdk_path = "#{test_dst_path}/appcelerator"
  widgets_src_path = "#{WEBSDK_DIR}/../widgets"
  widgets_dst_path = "#{test_dst_path}/widgets"
  
  puts File.expand_path(test_src_path)
  
  cp_r(test_src_path, test_dst_path)
  FileUtils.cp_r("#{WEBSDK_STAGE_DIR}/#{JS_PATH}", test_sdk_path) # there's no svn garbage here
  FileUtils.mkdir_p(widgets_dst_path, :verbose => VERBOSE)
  cp_r("#{WEBSDK_DIR}/src/common",       "#{test_sdk_path}/widgets/common")
  cp_r("#{WEBSDK_DIR}/src/web/images/", "#{test_sdk_path}/images/")
  cp_r("#{WEBSDK_DIR}/src/web/swf/", "#{test_sdk_path}/swf/")

  actions_src_path = "#{WEBSDK_DIR}/src/js/plugins"
  actions_dest_path = "#{test_sdk_path}/components/plugins"
  FileUtils.mkdir_p(actions_dest_path,:verbose=>VERBOSE) unless File.exists? actions_dest_path
  
  Dir["#{actions_src_path}/*_action.js"].each do |file|
    FileUtils.cp file, actions_dest_path
  end

  Dir["#{actions_src_path}/dynamic/*.js"].each do |file|
    FileUtils.cp file, actions_dest_path
  end
  
  puts "Copying tests ... this will take a few moments the first time through..."

  # copy all widgets (without building, because that is a pain)
  Dir["#{widgets_src_path}/*/src/"].each do |file|
    name = file[/widgets\/([^\/]+)\/src/,1]
    tf = "#{widgets_dst_path}/#{name}"
    sf = "#{file}#{name}.js"
    utf = File.join(tf,"#{name}_debug.js")
    if File.exists? utf
      a = md5 utf
      b = md5 sf
      next if a==b
    end
    cp_r(file,"#{widgets_dst_path}/#{name}")
    js = File.read sf
    puts "+ compressing #{sf}" if VERBOSE
    jsout = compress_and_mangle(sf,js,:js)
    f = File.open(File.join(tf,"#{name}.js"),'w')
    f.write jsout
    f.close
    f = File.open(utf,'w')
    f.write js
    f.close
  end  
  
  %w(controls layouts behaviors).each do |name|
    FileUtils.mkdir_p "#{test_sdk_path}/components/#{name}"
    Dir["#{WEBSDK_DIR}/../#{name}/*"].each do |file|
      next unless File.directory? file
      aname = File.basename(file)
      sf = "#{file}/#{aname}.js"
      td = "#{test_sdk_path}/components/#{name}/#{aname}/"
      utf = File.join(td,"#{aname}_debug.js")
      if File.exists? utf
        a = md5 utf
        b = md5 sf
        next if a==b
      end
      cp_r("#{WEBSDK_DIR}/../#{name}/#{aname}/",td)
      js = File.read sf
      t = File.join(td,"#{aname}.js")
      puts "+ compressing #{t}" if VERBOSE
      jsout = compress_and_mangle(sf,js,:js)
      f = File.open(t,'w')
      f.write jsout
      f.close
      f = File.open(utf,'w')
      f.write js
      f.close
    end
  end
  
  Dir["#{THEMES_DIR}/*"].each do |file|
    next unless File.directory?(file)
    type = File.basename(file)

    Dir["#{THEMES_DIR}/#{type}/*"].each do |f|
      next unless File.directory?(f)
      (control, theme) = File.basename(f).split('_', 2)

      tf = "#{test_sdk_path}/components/#{type}/#{control}/themes/#{theme}/#{theme}.js"
      utf = "#{test_sdk_path}/components/#{type}/#{control}/themes/#{theme}/#{theme}_debug.js"
      if File.exists? utf
        md5a = md5(utf)
        md5b = md5("#{THEMES_DIR}/#{type}/#{control}_#{theme}/#{theme}.js")
        next if md5a == md5b
      end
      cp_r("#{THEMES_DIR}/#{type}/#{control}_#{theme}/","#{test_sdk_path}/components/#{type}/#{control}/themes/#{theme}")
      puts "+ compressing #{tf}" if VERBOSE
      jsf = "#{test_sdk_path}/components/#{type}/#{control}/themes/#{theme}/#{theme}.js"
      js = File.read tf
      jsout = compress_and_mangle(tf,js,:js)
      f = File.open(tf,'w')
      f.write jsout
      f.close
      f = File.open(utf,'w')
      f.write js
      f.close
    end
  end
  FileUtils.cp_r("#{WEBSDK_DIR}/src/web/component_notfound.html","#{test_sdk_path}")
end

namespace :websdk do
  namespace :selenium do 
    task :start do
        start_selenium()
    end
    
    task :stop do 
        stop_selenium()
    end
    
    task :all => [:test] do 
        run_test([{:browser_name=>"Firefox Tests", :browser=>"firefox"},
                  {:browser_name=>'IE Tests', :browser=>'iexplore'}])
    end
    
    task :firefox => [:test] do 
        run_test([{:browser_name=>"Firefox Tests", :browser=>"firefox"}])
    end
  
    task :safari => [:test] do 
        run_test([{:browser_name=>"Safari Tests", :browser=>'safari'}])
    end
    
    task :ie => [:test] do 
        run_test([{:browser_name=>'IE Tests', :browser=>"iexplore"}])
    end
  end
  
  namespace :webrick do 
    task :start do
      start_webrick()
    end
    
    task :stop do 
      stop_webrick()
    end
  end
end

# copies everything except hidden directories
def cp_r(src,dst)
  src_root = Pathname.new(src)
  FileUtils.mkdir_p(dst, :verbose => VERBOSE) unless File.exists? dst
  Dir["#{src}/**/**"].each do |abs_path|
    src_path = Pathname.new(abs_path)
    rel_path = src_path.relative_path_from(src_root)
    dst_path = "#{dst}/#{rel_path.to_s}"
    
    next if abs_path.include? '.svn'
    
    if src_path.directory?
      FileUtils.mkdir_p(dst_path, :verbose => VERBOSE)
    elsif src_path.file?
      FileUtils.cp(abs_path, dst_path, :verbose => VERBOSE)
    end
  end
end

def start_webrick()
  if(File.exists?("#{STAGE_DIR}/tmp/webrick.pid"))
    return false
  end
  p "Starting Webrick"
  
  FileUtils.mkdir_p("#{STAGE_DIR}/tmp/", :verbose => true)
  
  if RUBY_PLATFORM.match(/win32/)
    require 'win32/process'
    process_info = Process.create(:app_name => "ruby  #{WEBSDK_DIR}\\test\\lib\\start_webrick.rb #{STAGE_DIR}")
    File.open("#{STAGE_DIR}/tmp/webrick.pid", "w") { |file| 
      file.puts(process_info.process_id)
    }
  else 
    pid = fork
    if pid 
      File.open("#{STAGE_DIR}/tmp/webrick.pid", "w") { |file| 
        file.puts(pid)
      }
    else 
      exec "ruby  #{WEBSDK_DIR}/test/lib/start_webrick.rb #{STAGE_DIR}"
    end
  end
  
  return true
end 

def kill_process(file_name)
  signum = 15
  if RUBY_PLATFORM.match(/win32/)
    require 'win32/process'
    signum = 5
  end
  file = File.open(file_name)
  pid = file.gets.strip!.to_i
  file.close
  p "Attempting to kill: #{pid}"
  Process.kill(signum, pid)
  File.delete(file_name)
end

def end_tests(success)
    stop_selenium() if selenium
    stop_webrick() if webrick
    
    if(!success)
        exit -1
    end
end

def stop_webrick()
  kill_process("#{STAGE_DIR}/tmp/webrick.pid")
end

def start_selenium()
  if(File.exists?("#{STAGE_DIR}/tmp/selenium.pid"))
    return false
  end
  
  p "Starting Selenium"
  FileUtils.mkdir_p("#{STAGE_DIR}/tmp/", :verbose => true)
  
  if RUBY_PLATFORM.match(/win32/)
    require 'win32/process'
    log = File.open("#{STAGE_DIR}/tmp/selenium.log", "w")
    process_info = Process.create(
        :app_name => "java -jar #{WEBSDK_DIR}\\test\\lib\\selenium-server.jar -browserSessionReuse",
        :startup_info => {:stdout => log},
        :creation_flags => Windows::Process::CREATE_NEW_PROCESS_GROUP
    )
    File.open("#{STAGE_DIR}/tmp/selenium.pid", "w") { |file| 
      file.puts(process_info.process_id)
    }
  else 
    pid = fork
    if pid 
      File.open("#{STAGE_DIR}/tmp/selenium.pid", "w") { |file| 
        file.puts(pid)
      }
    else
      $stdout.close
      $stdout = open("#{STAGE_DIR}/tmp/selenium.log", "w") 
      exec "java -jar #{WEBSDK_DIR}/test/lib/selenium-server.jar -browserSessionReuse"
      p "Shouldn't get here"
    end
  end
  
  return true
end

def stop_selenium()
  kill_process("#{STAGE_DIR}/tmp/selenium.pid")
end

def run_test(browsers)
    selenium = start_selenium()
    webrick = start_webrick()
    
    sleep 5 if( selenium or webrick)
    
    success = true
    browsers.each { |browser| 
        success = success && run_selenium_tests(browser[:browser_name], browser[:browser])
        system('taskkill /IM firefox.exe')  if RUBY_PLATFORM.match(/win32/) && browser[:browser] == "firefox"
    }
    
    # make selenium clean up on windows.  Bad assumption
    # that nobody is developing the sdk and running the
    # selenium tests with firefox running
    
    stop_selenium() if selenium
    stop_webrick() if webrick
    
    if(!success)
        throw "Selenium Tests Failed"
    end
end

def run_selenium_tests(browser_name, browser)
  require 'test/unit/testsuite'
  require 'test/unit/ui/console/testrunner'
  require 'test/lib/selenium'
  require 'test/lib/selenium_unit.rb'

  #
  # You need to manually include the tests
  # to be run here.  
  #
  require 'test/selenium/app_button_test'
  require 'test/selenium/app_calendar_test'
  require 'test/selenium/app_content_test'
  require 'test/selenium/app_datacache_test'
  require 'test/selenium/app_panel_test'
  require 'test/selenium/messaging_test'
  #
  # End includes for unit test files
  #
  
  results = Test::Unit::UI::Console::TestRunner.run(build_suite(browser_name, browser, 
         "http://localhost:9002"))
         
  if(results.error_count > 0 or results.failure_count > 0)
      return false
  end
  
  return true
end

def build_suite(name, browser, location)
    tests = ENV['tests']
    if tests 
        tests = tests.split(',')
    end
    
    suite = Test::Unit::SeleniumTestSuite.new(name, browser, location, "#{STAGE_DIR}/reports/#{browser}")
    ObjectSpace::each_object(Class) { |klass| 
        if klass < Test::Unit::SeleniumTestCase and (tests.nil? or tests.include?(klass.to_s))
            puts "Adding: #{klass}"
            suite << klass.suite 
        end
    }
    return suite
end
