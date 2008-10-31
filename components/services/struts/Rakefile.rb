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

def path(*args) File.expand_path(*args) end
struts_service_dir = File.dirname(__FILE__)
java_service_dir = path("../java", struts_service_dir)

require path("#{struts_service_dir}/../../build.rb")
require path("common.rb", java_service_dir)

config = load_config(struts_service_dir)
java_config = load_config(java_service_dir)

desc 'default struts build'

task :service_struts do
  struts_stage_dir = File.join(STAGE_DIR, "struts")
  java_build_dir = File.join(struts_stage_dir, "classes")
  app_source = File.join(java_service_dir, "src")
  app_struts_source = File.join(struts_service_dir, "src")

  dist_dir = File.join(struts_stage_dir, 'dist')
  copy_dir "#{struts_service_dir}/pieces", File.join(dist_dir, "pieces")
  FileUtils.cp("#{struts_service_dir}/install.rb", dist_dir)
  FileUtils.cp("#{struts_service_dir}/build.yml", dist_dir)

  lib_dir = File.join(struts_service_dir, "pieces/lib") # necessary to build -struts.jar
  dest_lib_dir = File.join(dist_dir, "pieces/lib")
 
  clean_dir(java_build_dir)
  FileUtils.mkdir_p to_path(java_build_dir) 

  # build the latest appcelerator.jar for this release
  java_cp_dir = File.join(java_service_dir, "pieces/lib")
  compile_dir(app_source, java_build_dir, java_cp_dir)
  app_jar_file = File.join(dest_lib_dir, "appcelerator-#{java_config[:version]}.jar")
  create_jar(app_jar_file, java_build_dir)

  # clean
  clean_dir(java_build_dir)
  FileUtils.mkdir_p to_path(java_build_dir) 

  # now create an appcelerator-struts.jar file
  compile_dir(app_struts_source, java_build_dir, [java_cp_dir, lib_dir, dest_lib_dir])
  struts_jar_file = File.join(dest_lib_dir, "appcelerator-struts-#{config[:version]}.jar")
  create_jar(struts_jar_file, java_build_dir)

  # copy necessary libs
  Dir["#{java_cp_dir}/**/*.jar"].each { |f| FileUtils.cp(f, dest_lib_dir) }
  Dir["#{lib_dir}/*.jar"].each { |f| FileUtils.cp(f, dest_lib_dir) }

  public_jar_path = File.join(dist_dir, "pieces/public/WEB-INF/lib")
  FileUtils.mkdir_p public_jar_path
  Dir["#{dest_lib_dir}/*.jar"].each { |f| FileUtils.cp(f, public_jar_path) }

  zipfile = path("service_struts_#{config[:version]}.zip", STAGE_DIR)
  FileUtils.rm_rf zipfile

  Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|

    dofiles(dist_dir) do |f|
      if not f == '.'
        zipfile.add("#{f}", "#{dist_dir}/#{f}")
      end
    end
  end

  FileUtils.rm_rf(struts_stage_dir)
end

