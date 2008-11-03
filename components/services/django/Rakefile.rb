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


  desc 'default python-django build'
  task :django do
  
    build_dir = File.expand_path(File.dirname(__FILE__))
    python_dir = File.join(build_dir, '..', 'python')
    build_config = get_config(:service, :django)
    python_config = get_config(:service, :python)
  
    FileUtils.mkdir_p "#{STAGE_DIR}"
    zipfile = "#{STAGE_DIR}/service_django_#{build_config[:version]}.zip"
    FileUtils.rm_rf zipfile
    
    stage_src = "#{STAGE_DIR}/python_src"
    FileUtils.cp_r "#{python_dir}/src", stage_src  
    setup_path = "#{stage_src}/module/setup.py"
    setup_content = File.read(setup_path)
    setup_content.sub!('0.0.0', python_config[:version])
    f = File.open setup_path,'w+'
    f.write setup_content
    f.close
    
    
    Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
  
      dofiles("#{stage_src}/module") do |f|
        filename = f.to_s
        next if File.basename(filename[0,1]) == '.'
        zipfile.add("module/#{filename}","#{stage_src}/module/#{filename}")
      end
      
      src_dir = "#{build_dir}/src"  
      dofiles(src_dir) do |f|
        filename = f.to_s
        next if File.basename(filename[0,1]) == '.'
        zipfile.add("project/#{filename}","#{src_dir}/#{filename}")
      end
          
      Dir["#{build_dir}/installer/plugins/*.rb"].each do |fpath|
        filename = File.basename(fpath)
        next if filename[0,1] == '.'
        zipfile.add("plugins/#{filename}",fpath)
      end
      
      zipfile.add('plugins/python_config.rb', "#{build_dir}/../python/installer/python_config.rb")
      zipfile.add('install.rb', "#{build_dir}/installer/install.rb")
      zipfile.add('build.yml',"#{build_dir}/build.yml")
    end
  end

