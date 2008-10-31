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

#BUILD_DIR = File.dirname(__FILE__)
#require File.expand_path("#{BUILD_DIR}/../../build.rb")
#require "common.rb"
puts blah()

build_config = load_config(BUILD_DIR)

desc 'default java build'

task :service_java do
  version = build_config[:version]
  java_dir = File.expand_path "#{STAGE_DIR}/java"
  java_classes = File.expand_path "#{java_dir}/classes"
  java_source = File.expand_path "#{BUILD_DIR}/src"

  clean_dir(java_dir)

  FileUtils.mkdir_p to_path(java_classes)
  FileUtils.mkdir_p File.join(java_dir,'dist') rescue nil
  FileUtils.mkdir_p File.join(java_dir,'dist','lib') rescue nil

  copy_dir "#{BUILD_DIR}/pieces", File.join(java_dir,'dist/pieces')
  FileUtils.cp("#{BUILD_DIR}/install.rb", File.join(java_dir, 'dist'))

  compile_dir(java_source, java_classes, "#{BUILD_DIR}/pieces/lib")
  jar_file = File.expand_path(File.join(java_dir, "dist/pieces/lib/appcelerator-#{version}.jar"))
  create_jar(jar_file, java_classes)

  f = File.open "#{java_dir}/dist/build.yml", 'w+'
  f.puts build_config.to_yaml
  f.close

  FileUtils.cd(java_classes) do

     zipfile = File.expand_path "#{STAGE_DIR}/service_java_#{build_config[:version]}.zip"
     FileUtils.rm_rf zipfile
     
     excludes = %w(pieces/lib/optional/spring-2.5.1.jar pieces/lib/optional/ant-1.7.0.jar pieces/lib/optional/cglib-2.1.3.jar pieces/lib/optional/junit.jar)
     
     Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
      dofiles("#{java_dir}/dist") do |f|
        filename = f.to_s
        if not filename == '.' and not excludes.include? filename
          zipfile.add(filename,"#{java_dir}/dist/#{filename}")
        end
      end
    end
  end
  FileUtils.rm_rf java_dir
end
