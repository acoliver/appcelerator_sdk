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

BUILD_DIR = File.dirname(__FILE__)
require File.expand_path("#{BUILD_DIR}/../../build.rb")

build_config = load_config(BUILD_DIR)

desc 'default websdk build'

task :service_websdk do
  version = build_config[:version]

  dist_dir = File.expand_path("#{STAGE_DIR}/websdk_service")
  FileUtils.mkdir_p(dist_dir)

  zipfile = "#{STAGE_DIR}/service_websdk_#{build_config[:version]}.zip"
  FileUtils.rm_rf(zipfile)

  FileUtils.cp("#{BUILD_DIR}/install.rb", dist_dir)
  FileUtils.cp("#{BUILD_DIR}/build.yml", dist_dir)
  copy_dir "#{BUILD_DIR}/pieces", File.join(dist_dir,'pieces')

  Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
    dofiles(dist_dir) do |f|
      filename = f.to_s
      if not(filename == '.') and not(filename[0] == ?.)
        zipfile.add(filename, "#{dist_dir}/#{filename}")
      end
    end
  end

  FileUtils.rm_rf(dist_dir)

end
