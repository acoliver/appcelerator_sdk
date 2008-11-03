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

  desc 'default perl build'
  task :perl do
  
    build_dir = File.expand_path(File.dirname(__FILE__))
    build_config = get_config(:service, :perl)
  
    FileUtils.mkdir_p "#{STAGE_DIR}"
    zipfile = "#{STAGE_DIR}/service_perl_#{build_config[:version]}.zip"
    FileUtils.rm_rf zipfile
  
    stage_dir = File.expand_path "#{STAGE_DIR}/perl"
    copy_dir "#{build_dir}/pieces", File.join(stage_dir,'pieces')
    
    FileUtils.cp("#{build_dir}/install.rb", stage_dir)
    FileUtils.cp("#{build_dir}/build.yml", stage_dir)
  
    Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
      dofiles(stage_dir) do |f|
        filename = f.to_s
        if not(filename == '.') 
          zipfile.add(filename, "#{stage_dir}/#{filename}")
        end
      end
    end
    
    FileUtils.rm_rf stage_dir
  end
