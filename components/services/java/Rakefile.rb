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

  desc "Build the Java Service"
  task :java do

    build_dir = File.expand_path(File.dirname(__FILE__))
    build_config = get_config(:service, :java)

    require File.join(build_dir, "common.rb")

    version = build_config[:version]
    java_dir = File.expand_path "#{STAGE_DIR}/java"
    java_classes = File.expand_path "#{java_dir}/classes"
    java_source = File.expand_path "#{build_dir}/src"
  
    clean_dir(java_dir)
  
    FileUtils.mkdir_p(java_classes)
    FileUtils.mkdir_p(File.join(java_dir,'dist')) rescue nil
    FileUtils.mkdir_p(File.join(java_dir,'dist','lib')) rescue nil
  
    copy_dir "#{build_dir}/pieces", File.join(java_dir,'dist/pieces')
    FileUtils.cp("#{build_dir}/install.rb", File.join(java_dir, 'dist'))
  
    compile_dir(java_source, java_classes, "#{build_dir}/pieces/lib")
    jar_file = File.expand_path(File.join(java_dir, "dist/pieces/lib/appcelerator-#{version}.jar"))
    create_jar(jar_file, java_classes)
  
    f = File.open "#{java_dir}/dist/build.yml", 'w+'
    f.puts build_config.to_yaml
    f.close
  
    FileUtils.cd(java_classes) do
  
       zipfile = build_config[:output_filename]
       FileUtils.rm_rf zipfile
       
       excludes = %w(pieces/lib/optional/spring-2.5.1.jar pieces/lib/optional/ant-1.7.0.jar pieces/lib/optional/cglib-2.1.3.jar pieces/lib/optional/junit.jar)
       
       Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
        dofiles("#{java_dir}/dist") do |f|
          filename = f.to_s
          if not filename == '.' and not excludes.include? filename
            zipfile.add(filename,"#{java_dir}/dist/#{filename}")
          end
        end
        zipfile.get_output_stream("build.yml") {|f| f.puts(YAML::dump(build_config)) }
      end
    end
    FileUtils.rm_rf java_dir

  end
