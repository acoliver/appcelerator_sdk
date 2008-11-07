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

desc 'default zend build'
task :zend do

  build_dir = File.expand_path(File.dirname(__FILE__))
  build_config = get_config(:service, :zend)

  FileUtils.mkdir_p(STAGE_DIR)
  zipfile = build_config[:output_filename]
  FileUtils.rm_rf zipfile

  stage_dir = File.expand_path "#{STAGE_DIR}/zend"
  copy_dir(File.join(build_dir, 'pieces'), File.join(stage_dir,'pieces'))

  FileUtils.cp("#{build_dir}/install.rb", stage_dir)

  unzip_file(File.join(build_dir, 'lib', 'ZendFramework-1.6.2.zip'),
             File.join(stage_dir, 'pieces', 'lib'))

  Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
    dofiles(stage_dir) do |f|
      filename = f.to_s
      if not(filename == '.') 
        zipfile.add(filename, "#{stage_dir}/#{filename}")
      end
    end
  end

  FileUtils.rm_rf(stage_dir)
end

def unzip_file(source, target)
  Zip::ZipFile.open(source) do |zipfile|
    zipfile.each { |entry|
      target_file = File.join(target, entry.name)
      FileUtils.mkdir_p(File.dirname(target_file))
      entry.extract(File.join(target, entry.name))
    }   
  end
end

