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

  desc 'default build'
  task :dotnet do

    build_dir = "#{File.dirname(__FILE__)}" 
    build_config = get_config(:service, :dotnet)

     dotnet_dir = "#{build_dir}/src"
     zipfile = build_config[:output_filename]
  
     FileUtils.mkdir_p STAGE_DIR
     FileUtils.rm_rf zipfile
  
     Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
      dofiles("#{dotnet_dir}") do |f|
        filename = f.to_s
        if not filename == '.'
          zipfile.add(filename,"#{dotnet_dir}/#{filename}")
        end
      end
      
      zipfile.add 'install.rb', "#{build_dir}/installer/install.rb"
      zipfile.add 'appcelerator.xml', "#{build_dir}/installer/appcelerator.xml"
      zipfile.add 'TestService.dll', "#{build_dir}/installer/TestService.dll"
      zipfile.add 'build.yml', "#{build_dir}/build.yml"
    end
  end
