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

desc 'default mochiweb build'
task :service_mochiweb do
  
  FileUtils.mkdir_p "#{STAGE_DIR}"
  zipfile = "#{STAGE_DIR}/service_mochiweb_#{build_config[:version]}.zip"
  FileUtils.rm_rf zipfile
  mochi_stage = "#{STAGE_DIR}/mochiweb"

  system('svn')
  if $?.exitstatus == 127
      puts 'You need to have Subversion installed to build this integration point,'
  end
  
  system('erlc')
  if $?.exitstatus == 127
    puts 'You need to have Erlang installed to build this integration point,'
    puts 'see: http://www.erlang.org/download.html'
  end
  
  # It's hard to tell how fast-changing mochiweb is,
  # so we'll just check out from their repository
  # if the buildmeister needs to update the version of mochiweb
  # that we're packaging, he should do a 'rake clean'
  # or remove the stage/mochiweb directory
  svn_url = 'http://mochiweb.googlecode.com/svn/trunk/'
  unless File.exists? mochi_stage
      system("svn co #{svn_url} #{mochi_stage}")
  end
  
  FileUtils.cp_r("#{BUILD_DIR}/pieces/.", mochi_stage)
  FileUtils.cd(mochi_stage) do
    system("make")
  end
  
   # to silence a warning no project creation
  FileUtils.rm("#{mochi_stage}/priv/skel/priv/www/index.html", :force => true)
  
  Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
    dofiles_and_dirs(mochi_stage) do |filename|
      if filename != '.'
        zipfile.add("mochiweb/#{filename}","#{mochi_stage}/#{filename}")
      end
    end
    
    zipfile.add('install.rb',"#{BUILD_DIR}/install.rb")
    zipfile.add('build.yml',"#{BUILD_DIR}/build.yml")
  end
end

