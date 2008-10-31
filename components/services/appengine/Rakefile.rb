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

BUILD_DIR = "#{File.dirname(__FILE__)}" 
require File.expand_path("#{BUILD_DIR}/../../build.rb")
build_config = load_config(BUILD_DIR)

desc 'default google-appengine-python build'
task :service_appengine do

  FileUtils.mkdir_p "#{STAGE_DIR}"
  zipfile = "#{STAGE_DIR}/service_appengine_#{build_config[:version]}.zip"
  FileUtils.rm_rf zipfile
  
  src_dir = "#{BUILD_DIR}/src"
  lib_dir = "#{BUILD_DIR}/lib"
  py_dir  = "#{BUILD_DIR}/../python/src/module/appcelerator"
  
  Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
    
    dofiles(src_dir) do |f|
      filename = f.to_s
      next if File.basename(filename[0,1]) == '.'
      zipfile.add("project/#{filename}","#{src_dir}/#{filename}")
    end
    
    dofiles(lib_dir) do |f|
      filename = f.to_s
      next if File.basename(filename[0,1]) == '.'
      zipfile.add("project/#{filename}","#{lib_dir}/#{filename}")
    end
    
    dofiles(py_dir) do |f|
      filename = f.to_s
      next if File.basename(filename[0,1]) == '.'
      zipfile.add("project/appcelerator/#{filename}","#{py_dir}/#{filename}")
    end
    
    Dir["#{BUILD_DIR}/installer/plugins/*.rb"].each do |fpath|
      filename = File.basename(fpath)
      next if filename[0,1] == '.'
      zipfile.add("plugins/#{filename}",fpath)
    end
    
    zipfile.add('plugins/python_config.rb', "#{BUILD_DIR}/../python/installer/python_config.rb")
    zipfile.add('install.rb', "#{BUILD_DIR}/installer/install.rb")
    zipfile.add('build.yml',"#{BUILD_DIR}/build.yml")
  end
end

