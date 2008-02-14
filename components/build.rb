#
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

VERBOSE = ENV['v'] || ENV['verbose'] || ENV['VERBOSE']
CWD = File.expand_path "#{File.dirname(__FILE__)}"
STAGE_DIR = File.expand_path "#{CWD}/../stage"

def md5_file(file)
   md5 = Digest::MD5.hexdigest File.read(file)
   f = File.open "#{file}.md5", 'w+'
   f.puts md5
   f.close
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
    class << self
      def redefine_task(*args, &block)
        Rake.application.redefine_task(self, *args, &block)
      end
    end
  end
  
  module TaskManager
    def redefine_task(task_class, *args, &block)
       task_name, arg_names, deps = resolve_args(args)
       task_name = task_class.scope_name(@scope, task_name)
       deps = [deps] unless deps.respond_to?(:to_ary)
       deps = deps.collect {|d| d.to_s }
       task = @tasks[task_name.to_s] = task_class.new(task_name, self)
       task.set_arg_names(arg_names) unless arg_names.empty?
       task.add_description(@last_description)
       @last_description = nil
       task.enhance(deps, &block)
       task
    end
  end

end

def task(*args, &block)
   Rake::Task.redefine_task(*args, &block)
end


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

def build_subdir(dir)
  Dir["#{dir}/*"].each do |dir|
    next unless File.directory? dir
    FileUtils.cd(dir) do |d|
      next unless File.file? "#{d}/Rakefile"
      system "rake"
    end
  end
end

def java_path_separator
  RUBY_PLATFORM=~/win32/ ? ';' : ':'
end

def save_config(dir,config)
  fn = File.join(dir,'build.yml')
  f = File.open(fn,'w+')
  f.puts config.to_yaml
  f.close
end

def load_config(dir)
  fn = File.join(dir,'build.yml')
  config = Hash.new
  config = YAML::load_file(fn) if File.exists?(fn)
  config[:version] = 1.0 unless File.exists?(fn)
  at_exit { save_config(dir,config) }
  config 
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

desc 'default build will build all services'
task :default => [:stage] do
  build_subdir "#{Dir.pwd}"
end

