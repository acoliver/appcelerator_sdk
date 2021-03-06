
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


  desc 'default mule build'
  task :mule do
    mule_service_dir = File.expand_path(File.dirname(__FILE__))
    java_service_dir = File.join(mule_service_dir, '..', 'java')
  
    require File.join(java_service_dir, 'common.rb')
  
    config = get_config(:service, :mule)
    java_config = get_config(:service, :java)
  
    mule_stage_dir = File.join(STAGE_DIR, "mule")
    java_build_dir = File.join(mule_stage_dir, "classes")
    app_source = File.join(java_service_dir, "src")
    app_mule_source = File.join(mule_service_dir, "src")
  
    dist_dir = File.join(mule_stage_dir, 'dist')
    copy_dir "#{mule_service_dir}/pieces", File.join(dist_dir, "pieces")
    FileUtils.cp("#{mule_service_dir}/install.rb", dist_dir)
  
    lib_dir = File.join(mule_service_dir, "pieces/lib") # necessary to build -mule.jar
    dest_lib_dir = File.join(dist_dir, "pieces/lib")
   
    clean_dir(java_build_dir)
    FileUtils.mkdir_p java_build_dir
  
    # build the latest appcelerator.jar for this release
    java_cp_dir = File.join(java_service_dir, "pieces/lib")
    compile_dir(app_source, java_build_dir, java_cp_dir)
    app_jar_file = File.join(dest_lib_dir, "appcelerator-#{java_config[:version]}.jar")
    create_jar(app_jar_file, java_build_dir)
  
    # clean
    clean_dir(java_build_dir)
    FileUtils.mkdir_p java_build_dir
  
    # now create an appcelerator-mule.jar file
    compile_dir(app_mule_source, java_build_dir, [java_cp_dir, lib_dir, dest_lib_dir])
    mule_jar_file = File.join(dest_lib_dir, "appcelerator-mule-#{config[:version]}.jar")
    create_jar(mule_jar_file, java_build_dir)
  
    # copy necessary libs
    Dir["#{java_cp_dir}/**/*.jar"].each { |f| FileUtils.cp(f, dest_lib_dir) }
    Dir["#{lib_dir}/*.jar"].each { |f| FileUtils.cp(f, dest_lib_dir) }
  
    public_jar_path = File.join(dist_dir, "pieces/public/WEB-INF/lib")
    FileUtils.mkdir_p public_jar_path
    Dir["#{dest_lib_dir}/*.jar"].each { |f| FileUtils.cp(f, public_jar_path) }
  
    zipfile = config[:output_filename]
    FileUtils.rm_rf zipfile
  
    Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
  
      dofiles(dist_dir) do |f|
        if not f == '.'
          zipfile.add("#{f}", "#{dist_dir}/#{f}")
        end
      end
    end
  
    FileUtils.rm_rf(mule_stage_dir)
  end
