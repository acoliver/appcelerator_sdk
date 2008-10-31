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

desc 'default build'
task :service_dotnet do
   dotnet_dir = "#{BUILD_DIR}/src"
   zipfile = "#{STAGE_DIR}/service_dotnet_#{build_config[:version]}.zip"

   FileUtils.mkdir_p STAGE_DIR
   FileUtils.rm_rf zipfile

   Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
    dofiles("#{dotnet_dir}") do |f|
      filename = f.to_s
      if not filename == '.'
        zipfile.add(filename,"#{dotnet_dir}/#{filename}")
      end
    end
    
    zipfile.add 'install.rb', "#{BUILD_DIR}/installer/install.rb"
    zipfile.add 'appcelerator.xml', "#{BUILD_DIR}/installer/appcelerator.xml"
    zipfile.add 'TestService.dll', "#{BUILD_DIR}/installer/TestService.dll"
    zipfile.add 'build.yml', "#{BUILD_DIR}/build.yml"
  end
end
