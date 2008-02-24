# This file is part of Appcelerator.
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# Appcelerator is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

Appcelerator::CommandRegistry.registerCommand('project:rollback','rollback project change (install, update)',[
  {
    :name=>'path',
    :help=>'path of the project',
    :required=>false,
    :default=>nil,
    :type=>[
      Appcelerator::Types::FileType,
      Appcelerator::Types::DirectoryType,
      Appcelerator::Types::AlphanumericType
    ],
    :conversion=>Appcelerator::Types::DirectoryType
  }
],nil,[
  'rollback',
  'rollback ~/myproject'
]) do |args,options|
  
  pwd = args[:path] || Dir.pwd

  fail = false
  
  FileUtils.cd(pwd) do 
    # this is used to make sure we're in a project directory
    lang = Appcelerator::Project.get_service(pwd)
    
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

      tx = Appcelerator::IOTransaction.new pwd,true,OPTIONS[:verbose]||OPTIONS[:debug]
      tx.rollback

      puts "Rollback complete...."
      
      FileUtils.rm_rf rollback_dir
    end

  end
  
  die if fail
end