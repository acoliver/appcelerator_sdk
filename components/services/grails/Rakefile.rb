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


  desc 'default grails build'
  task :grails do

    grails_service_dir = File.expand_path(File.dirname(__FILE__))
    java_service_dir = File.join(grails_service_dir, '..', 'java')
    
    require File.join(java_service_dir, "common.rb")
    
    config = get_config(:service, :grails)
    java_config = get_config(:service, :java)
  
    grails_stage_dir = File.join(STAGE_DIR, "grails")
    app_source = File.join(java_service_dir, "src")
  
    dist_dir = File.join(grails_stage_dir, 'dist')
    copy_dir "#{grails_service_dir}/pieces", File.join(dist_dir, "pieces")
    FileUtils.cp("#{grails_service_dir}/install.rb", dist_dir)
    FileUtils.cp("#{grails_service_dir}/build.yml", dist_dir)
  
    java_build_dir = File.join(grails_stage_dir, "classes")
    clean_dir(java_build_dir)
    FileUtils.mkdir_p(java_build_dir) 
  
    # build the latest appcelerator.jar for this release
    dist_lib_dir = File.join(dist_dir, "pieces/grails_plugins/appcelerator/lib")
    java_cp_dir = File.join(java_service_dir, "pieces/lib")
    compile_dir(app_source, java_build_dir, java_cp_dir)
    app_jar_file = File.join(dist_lib_dir, "appcelerator-#{java_config[:version]}.jar")
    create_jar(app_jar_file, java_build_dir)
  
    # clean
    clean_dir(java_build_dir)
  
    zipfile = config[:output_filename]
    FileUtils.rm_rf zipfile
  
    Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
  
      dofiles(dist_dir) do |f|
        if not f == '.'
          zipfile.add("#{f}", "#{dist_dir}/#{f}")
        end
      end
    end
  
    FileUtils.rm_rf(grails_stage_dir)
  end

