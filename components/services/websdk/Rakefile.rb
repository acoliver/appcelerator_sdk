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

  desc 'default websdk build'
  task :websdk do

    build_dir = File.expand_path(File.dirname(__FILE__))
    build_config = get_config(:service, :websdk)
    version = build_config[:version]
  
    dist_dir = File.expand_path("#{STAGE_DIR}/websdk_service")
    FileUtils.mkdir_p(dist_dir)
  
    zipfile = build_config[:output_filename]
    FileUtils.rm_rf(zipfile)
  
    FileUtils.cp("#{build_dir}/install.rb", dist_dir)
    FileUtils.cp("#{build_dir}/build.yml", dist_dir)
    copy_dir "#{build_dir}/pieces", File.join(dist_dir,'pieces')
  
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
