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

  desc 'default ruby build'
  task :ruby do
  
    build_dir = File.expand_path(File.dirname(__FILE__))
    build_config = get_config(:service, :ruby)
  
    FileUtils.mkdir_p "#{STAGE_DIR}"
    zipfile = build_config[:output_filename]
    FileUtils.rm_rf zipfile
  
    Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
      dofiles("#{build_dir}/src") do |f|
        filename = f.to_s
        if not filename == '.'
          zipfile.add("rails/#{filename}","#{build_dir}/src/#{filename}")
        end
      end
      zipfile.add('install.rb',"#{build_dir}/installer/install.rb")
      Dir["#{build_dir}/installer/plugins/*.rb"].each do |fpath|
        fname = File.basename(fpath)
        zipfile.add("plugins/#{fname}",fpath)
      end
      Dir["#{build_dir}/../common/ruby/agent/**/*.rb"].each do |fpath|
        i = fpath.index('agent/')
        fname = fpath[i..-1]
        zipfile.add("rails/vendor/plugins/appcelerator/lib/appcelerator/#{fname}",fpath)
      end
    end
    zipfile.get_output_stream("build.yml") {|f| f.puts(YAML::dump(build_config)) }
  end
