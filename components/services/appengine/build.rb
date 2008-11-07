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

  desc 'default google-appengine-python build'
  task :appengine do
  
    build_dir = "#{File.dirname(__FILE__)}" 
    build_config = get_config(:service, :appengine)
    zipfile = build_config[:output_filename]
  
    FileUtils.mkdir_p "#{STAGE_DIR}"
    FileUtils.rm_rf zipfile
    
    src_dir = "#{build_dir}/src"
    lib_dir = "#{build_dir}/lib"
    py_dir  = "#{build_dir}/../python/src/module/appcelerator"
    
    Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
      
      dofiles(src_dir) do |f|
        filename = f.to_s
        next if File.basename(filename[0,1]) == '.'
        zipfile.add("project/#{filename}","#{src_dir}/#{filename}")
      end
      
      dofiles(lib_dir) do |f|
        filename = f.to_s
        next if File.basename(filename[0,1]) == '.'
        zipfile.add("project/#{filename}","#{lib_dir}/#{filename}")
      end
      
      dofiles(py_dir) do |f|
        filename = f.to_s
        next if File.basename(filename[0,1]) == '.'
        zipfile.add("project/appcelerator/#{filename}","#{py_dir}/#{filename}")
      end
      
      Dir["#{build_dir}/installer/plugins/*.rb"].each do |fpath|
        filename = File.basename(fpath)
        next if filename[0,1] == '.'
        zipfile.add("plugins/#{filename}",fpath)
      end
      
      zipfile.add('plugins/python_config.rb', "#{build_dir}/../python/installer/python_config.rb")
      zipfile.add('install.rb', "#{build_dir}/installer/install.rb")

      zipfile.get_output_stream('build.yml') {|f| f.puts(YAML::dump(build_config)) }
    end
  end
