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
desc 'default python build'
task :python do

  build_dir = File.expand_path(File.dirname(__FILE__))
  build_config = get_config(:service, :python)

  version = build_config[:version]
  zipfile = build_config[:output_filename]

  FileUtils.mkdir_p "#{STAGE_DIR}"
  FileUtils.rm_rf zipfile
  
  stage_dir = "#{STAGE_DIR}/python_build"

  FileUtils.mkdir_p(File.join(stage_dir,'pieces'))
  FileUtils.cp_r("#{build_dir}/pieces", stage_dir)
  FileUtils.cp_r("#{build_dir}/appcelerator-module", stage_dir)
  FileUtils.cp("#{build_dir}/install.rb", stage_dir)

  setup_path = "#{stage_dir}/appcelerator-module/setup.py"
  setup_content = File.read(setup_path)
  setup_content.sub!('0.0.0', version)
  f = File.open setup_path,'w+'
  f.write setup_content
  f.close

  Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
    dofiles(stage_dir) do |f|
      filename = f.to_s
      if not(filename == '.') and not(filename[0] == ?.)
        zipfile.add(filename, "#{stage_dir}/#{filename}")
      end
    end
  end
  FileUtils.rm_rf stage_dir
end

