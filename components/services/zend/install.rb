#
# Copyright 2006-2008 Appcelerator, Inc.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#    http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License. 



module Appcelerator
  class Zend
    def create_project(from_path,to_path,config,tx)
      puts "Creating new zend framework project using #{from_path}" if OPTIONS[:debug]

      exclude = ["#{__FILE__}",'build.yml', '.project']
      Appcelerator::Installer.copy(tx, "#{from_path}/src/.", "#{to_path}", exclude, true)

      %w(log script).each do |name|
        FileUtils.rm_rf("#{to_path}/#{name}")
      end

      FileUtils.cp("#{from_path}/src/.project", "#{to_path}")
      search_and_replace_in_file("#{to_path}/.project",
                                 "MYAPP",
                                  File.basename(to_path))
      true
    end

    def search_and_replace_in_file(file, to_find, to_replace)
      content = File.read(file).gsub!(to_find, to_replace)

      f = File.open(file,'w+')
      f.puts(content)
      f.flush()
      f.close()
      true
    end
    
  end
end


