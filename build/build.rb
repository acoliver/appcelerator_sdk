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

require 'rake'
require 'fileutils'
require 'pathname'
require 'find'
require 'zip/zip'
require 'yaml'
require 'digest/md5'

cwd = File.expand_path(File.dirname(__FILE__))

require File.join(cwd, 'release.rb')

ROOT_DIR = File.expand_path(File.join(cwd, '..'))
BUILD_DIR = File.join(ROOT_DIR, 'build')
STAGE_DIR = File.join(ROOT_DIR, 'stage')
COMPONENTS_DIR = File.join(ROOT_DIR, 'components')
SERVICES_DIR = File.join(COMPONENTS_DIR, 'services')
BEHAVIORS_DIR = File.join(COMPONENTS_DIR, 'behaviors')
CONTROLS_DIR = File.join(COMPONENTS_DIR, 'controls')
LAYOUTS_DIR = File.join(COMPONENTS_DIR, 'layouts')
WIDGETS_DIR = File.join(COMPONENTS_DIR, 'widgets')
THEMES_DIR = File.join(COMPONENTS_DIR, 'themes')
WEBSDK_DIR = File.join(COMPONENTS_DIR, 'websdk')
RUNTIME_DIR = File.join(COMPONENTS_DIR, 'runtime')

VERBOSE = ENV['v'] || ENV['verbose'] || ENV['VERBOSE']
COMPRESS = ENV['nomin'] ? false : true 

CONFIG = YAML::load_file(File.join(BUILD_DIR, 'config.yml'))

# Load the release system and try to initialize
# it using the S3 Transport
puts("Connecting to release server...")
t = S3Transport.new(DISTRO_BUCKET, CONFIG)
MANIFEST = t.manifest

# inject defaults for build configurations
CONFIG[:releases].each_pair {|type, rels|
  to_add = {}
  rels.each_pair { |name, rel_config|
    
    # if no config is found, create a default config
    if rel_config.nil?
        rel_config = to_add[name] = {}
    end

    # inject name and type into config
    str_name = name.to_s
    rel_config[:name] = str_name

    # duplicate config replacing : with _ if we are trying
    # to look for it that way
    if str_name.include?(':')
        to_add[str_name.sub(':', '_').to_sym] = rel_config
    end

    typename = type.to_s
    if (typename =~ /^theme_/)
        rel_config[:type] = "theme"
        rel_config[:control] = typename.sub("theme_", "")
    else
        rel_config[:type] = typename
    end

    # inject the default license
    rel_config[:licenses] = (rel_config[:licenses] || []) | CONFIG[:licenses]

    # inject the current version as the version
    version = MANIFEST.get_current_version(type, name)
    rel_config[:version] = version

    # inject the output file path
    output_file = File.join(STAGE_DIR, "#{type.to_s}-#{name.to_s}-#{version.to_s}.zip")
    rel_config[:output_filename] = output_file 
  }

  rels.merge!(to_add)
}

def get_config(type, name)
    type = type.join('_').to_sym if type.class == Array
    config = CONFIG[:releases][type][name] rescue nil
    puts "No configuration for #{type} named #{name}" unless config
    config
end

# Convert a directoyr of directories into a namespace of Rake tasks
# If a Rakefile exists in one of those directories, don't add it as
# a task for that namespace, instead just source the Rakefile
#
# types can be an array of nested types which will result in nested namespaces
# excludes are directories that you want to ignore
def directory_to_namespace(types, dir, excludes=[], i=0, nspace="")
  return directory_to_namespace([types], dir, excludes) if types.class != Array

  # recursively define this namespace 
  if i < types.length
      namespace types[i] do
          nspace = "#{nspace}#{types[i].to_s}:"
          directory_to_namespace(types, dir, excludes, i + 1, nspace)
          all_task(nspace) # create an all task for this namespace
      end
      return
  end

  # no more namespaces to enter, simply create our tasks
  dirs = Dir["#{dir}/*"].reject { |f| not File.directory?(f) }
  dirs.each { |subdir|
    next if excludes.include?(File.basename(subdir))

    subdir = File.expand_path(subdir)
    rfile = File.join(subdir, 'Rakefile.rb')
    name = File.basename(subdir).to_sym

    if File.exists?(rfile) # first try Rakefile.rb in directory
        require rfile

    else # otherwise try a simple build
        task name do
            config = get_config(types, name)
            build_simple_component(config, subdir)
        end
    end

    # inject config afterward
    Rake::Task["#{nspace}#{name}"].enhance do
        config = get_config(types, name)
        add_config_to_zip(config)
    end

  }
end

def all_task(nspace)
    task :all do
        tasks = Rake.application.tasks.each { |t|
           if t.name.include?(nspace) and not t.name.include?(':all')
             puts "\nBuilding #{t.name}"
             Rake::Task["#{t.name}"].invoke
           end
        }
    end
end

# the simplest type of build, simply zip everything up
# and compress all the included javascript files --
# used for components, themes and widgets
def build_simple_component(config, dir)
  name = config[:name]

  if config[:licenses].nil? or config[:licenses].empty?
    STDERR.puts "Before you can build the control, you need to set the licensing type."
    STDERR.puts "Please see LICENSING.readme file for details or visit the documentation"
    STDERR.puts "for more information."
    exit 1
  end

  output_file = config[:output_filename]
  FileUtils.rm_f(output_file)

  Zip::ZipFile.open(output_file, Zip::ZipFile::CREATE) do |zipfile|
    src_path = Pathname.new(dir)

    Find.find(dir) do |path|
      pathname = Pathname.new(path)

      next if path.include? '.svn'
      next if path.include? 'Rakefile'
      next if path.include? 'LICENSING.readme'
      next if not pathname.file?

      filename = pathname.relative_path_from(src_path)
      if path.include? "#{name}.js"
        zipfile.get_output_stream(filename) do |f|
          c = File.read(path)
          f.puts(c.gsub('__VERSION__', config[:version]))
        end
      else
        zipfile.add(filename, path)
      end
    end
  end

  # TODO: inline this at some point
  compress_js_in_zip(output_file)

end

def add_config_to_zip(config)
  zipfile = config[:output_filename]
  Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
    config = config.reject { |k,v| k == :output_filename }
    zipfile.get_output_stream('build.yml') do |f|
      f.puts(YAML::dump(config))
    end
  end
end


def md5(file)
  Digest::MD5.hexdigest File.read(file)
end

def md5_file(file)
   f = File.open "#{file}.md5", 'w+'
   f.puts md5(file)
   f.close
end


def clean_dir(dir)
  FileUtils.rm_r dir if File.exists?(dir)
  FileUtils.mkdir_p dir
end

# monkey patch to be able to call a task
# more than once
#
#module Rake
#  class Task
#    def invokeAgain
#      @already_invoked = false
#      self.invoke
#    end
#    class << self
#      def redefine_task(*args, &block)
#        Rake.application.redefine_task(self, *args, &block)
#      end
#    end
#  end
#  
#  module TaskManager
#    def redefine_task(task_class, *args, &block)
#       task_name, arg_names, deps = resolve_args(args)
#       task_name = task_class.scope_name(@scope, task_name)
#       deps = [deps] unless deps.respond_to?(:to_ary)
#       deps = deps.collect {|d| d.to_s }
#       task = @tasks[task_name.to_s] = task_class.new(task_name, self)
#       task.set_arg_names(arg_names) unless arg_names.empty?
#       task.add_description(@last_description)
#       @last_description = nil
#       task.enhance(deps, &block)
#       task
#    end
#  end
#
#end

#def task(*args, &block)
#   Rake::Task.redefine_task(*args, &block)
#end


def copy_dir(src, dest)
  srcdir = Pathname.new(src)
  destdir = Pathname.new(dest)
  Find.find(src) do |path|
    pathname = Pathname.new(path)
    if not path.include? '.svn' and not path.include? '.DS_Store' and pathname.file?
      filename = pathname.relative_path_from(srcdir)
      dir = "#{destdir}/#{filename.dirname}"
      FileUtils.mkdir_p(dir)
      FileUtils.cp path,dir
    end
  end
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

def dofiles_and_dirs(dir)
  Find.find(dir) do |path|
    pathname = Pathname.new(path)
    if not path.include? '.svn'
      filename = pathname.relative_path_from(Pathname.new(dir))
      yield filename
    end
  end
end


YUI_VERSION = '2.3.6'
YUI_JAR = "#{WEBSDK_DIR}/lib/yuicompressor-#{YUI_VERSION}.jar"
YUI_COMPRESSOR = "java -jar \"#{YUI_JAR}\""
COMPRESS_RB = "ruby \"#{WEBSDK_DIR}/lib/compress.rb\""

def compress_fail(src,tf)
  if tf
    $stderr.puts File.read(tf)
    $stderr.puts
  end
  $stderr.puts "source of file was: \n\n#{src}"
  fail("Syntax error in websdk source, unable to compress")
end

def compress_and_mangle(file,code,type=:js)
  
  if code.strip.length == 0
    return ''
  end
  
  path = File.expand_path(File.join(Dir.tmpdir,"#{rand($$)}"))

  filein = "#{path}.in.#{type}"
  
  FileUtils.rm_rf filein if File.exists?(filein)
  f = File.open(filein,'w')
  f.puts code
  f.close
  
  fileout = "#{path}.out.#{type}"

  error_temp_file = "#{path}.err"

#  if VERBOSE or is_win32
  if is_win32
    suppress_output = ""
  else
    suppress_output = ">#{error_temp_file} 2>&1"
  end
  
  call_command("#{YUI_COMPRESSOR} \"#{filein}\" -o \"#{fileout}\" #{suppress_output}") || compress_fail(file,error_temp_file)
  File.read("#{fileout}")
end

def is_win32()
    !(RUBY_PLATFORM =~ /(windows|win32)/).nil?
end

def call_command(cmd)
  if is_win32
    cmd= "cmd.exe /c #{cmd}"
    result = system(cmd)
    if !result
      puts "failed running #{cmd}"
      puts "#{$2}"
    end
    result
  else
    system cmd
  end
end

#
# this method will compress any JS/CSS in the zip and replace it
#
def compress_js_in_zip(zf)
  
  path = File.expand_path(File.join(Dir.tmpdir,"#{rand($$)}"))
  
  files = []
  
  Zip::ZipFile.foreach(zf) do |z|
    if z.name =~ /\.(js|css)$/
      files << z
    end
  end
  
  Zip::ZipFile.open(zf) do |z|
    files.each do |f|
      js = z.read(f)
      type = (f.name =~ /\.js$/) ? :js : :css
      jsout = compress_and_mangle(f.name,js,type)
      FileUtils.rm_rf path if File.exists? path
      jf = File.open(path,'w+')
      jf.write jsout
      jf.close
      z.get_output_stream(f.name) {|zf| zf.write jsout }
      if type == :js
        z.get_output_stream(f.name.gsub('.js','_debug.js')) { |zf| zf.puts js }
      else
        z.get_output_stream(f.name.gsub('.css','_debug.css')) { |zf| zf.puts js }
      end
    end
  end
  
  FileUtils.rm_rf path
end

