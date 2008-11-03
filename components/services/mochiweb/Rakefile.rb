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

  desc 'default mochiweb build'
  task :mochiweb do
  
    puts 'Mochiweb is on hold for now!'
    #build_dir = File.expand_path(File.dirname(__FILE__))
    #build_config = get_config(:service, :mochiweb)
    #
    #FileUtils.mkdir_p "#{STAGE_DIR}"
    #zipfile = "#{STAGE_DIR}/service_mochiweb_#{build_config[:version]}.zip"
    #FileUtils.rm_rf zipfile
    #mochi_stage = "#{STAGE_DIR}/mochiweb"
  
    #system('svn')
    #if $?.exitstatus == 127
    #    puts 'You need to have Subversion installed to build this integration point,'
    #end
    #
    #system('erlc')
    #if $?.exitstatus == 127
    #  puts 'You need to have Erlang installed to build this integration point,'
    #  puts 'see: http://www.erlang.org/download.html'
    #end
    #
    ## It's hard to tell how fast-changing mochiweb is,
    ## so we'll just check out from their repository
    ## if the buildmeister needs to update the version of mochiweb
    ## that we're packaging, he should do a 'rake clean'
    ## or remove the stage/mochiweb directory
    #svn_url = 'http://mochiweb.googlecode.com/svn/trunk/'
    #unless File.exists? mochi_stage
    #    system("svn co #{svn_url} #{mochi_stage}")
    #end
    #
    #FileUtils.cp_r("#{build_dir}/pieces/.", mochi_stage)
    #FileUtils.cd(mochi_stage) do
    #  system("make")
    #end
    #
    # # to silence a warning no project creation
    #FileUtils.rm("#{mochi_stage}/priv/skel/priv/www/index.html", :force => true)
    #
    #Zip::ZipFile.open(zipfile, Zip::ZipFile::CREATE) do |zipfile|
    #  dofiles_and_dirs(mochi_stage) do |filename|
    #    if filename != '.'
    #      zipfile.add("mochiweb/#{filename}","#{mochi_stage}/#{filename}")
    #    end
    #  end
    #  
    #  zipfile.add('install.rb',"#{build_dir}/install.rb")
    #  zipfile.add('build.yml',"#{build_dir}/build.yml")
    #end
  end
