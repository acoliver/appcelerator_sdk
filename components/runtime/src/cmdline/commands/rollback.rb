#
# This file is part of Appcelerator.
#
# Copyright (c) 2006-2008, Appcelerator, Inc.
# All rights reserved.
# 
# Redistribution and use in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
# 
#     * Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
# 
#     * Redistributions in binary form must reproduce the above copyright notice,
#       this list of conditions and the following disclaimer in the documentation
#       and/or other materials provided with the distribution.
# 
#     * Neither the name of Appcelerator, Inc. nor the names of its
#       contributors may be used to endorse or promote products derived from this
#       software without specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
#

include Appcelerator
CommandRegistry.registerCommand('rollback:project','rollback project change (install, update)',[
  {
    :name=>'path',
    :help=>'path of the project',
    :required=>false,
    :default=>nil,
    :type=>[
      Types::FileType,
      Types::DirectoryType,
      Types::AlphanumericType
    ],
    :conversion=>Types::DirectoryType
  }
],nil,[
  'rollback',
  'rollback ~/myproject'
], :project) do |args,options|

  pwd = File.expand_path(args[:path] || Dir.pwd)

  fail = false

  FileUtils.cd(pwd) do 
    # this is used to make sure we're in a project directory
    lang = Project.get_service(pwd)
  
    rollback_dir = "#{pwd}/tmp/rollback"
  
    if not File.exists?(rollback_dir)
      STDERR.puts "No rollbacks found for project at #{pwd}"
      fail = true
    else
      manifest = YAML::load_file "#{rollback_dir}/manifest.yml"

      puts "Found rollback for command =>  #{manifest[:cmdline]}"
      puts "which was executed on #{manifest[:time]}"
      puts "This command affected #{manifest[:count]} affected files/directories"
      puts

      confirm "Are you sure you want to rollback changes? [yN] ",false,true,'n'

      tx = IOTransaction.new pwd,true,OPTIONS[:verbose]||OPTIONS[:debug]
      tx.rollback

      puts "Rollback complete...."
    
      FileUtils.rm_rf rollback_dir
    end

  end

  die if fail
end

