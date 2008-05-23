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

include Appcelerator
CommandRegistry.registerCommand('publish:assets','publish asset files to Amazon S3',[
  {
    :name=>'bucket',
    :help=>'AWS bucket name',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  },
  {
    :name=>'path',
    :help=>'path within bucket which will be appended to path for files',
    :required=>false,
    :default=>'',
    :type=>Types::StringType
  }
],nil,[
  'publish:assets my_bucket',
  'publish:assets my_bucket mypath'
]) do |args,options|

  bucket = args[:bucket]
  path = args[:path]
  
  if not ENV['AWS_ACCESS_KEY_ID']
    $stderr.puts "Please make sure you set the environment variable 'AWS_ACCESS_KEY_ID' to your AWS access key and re-run this command."
    exit 1
  end

  if not ENV['AWS_SECRET_ACCESS_KEY']
    $stderr.puts "Please make sure you set the environment variable 'AWS_SECRET_ACCESS_KEY' to your AWS secret access key and re-run this command."
    exit 1
  end
  
  rb = File.expand_path(File.join(File.dirname(__FILE__),'s3','s3sync.rb'))
  
  # this is used to make sure we're in a project directory
  lang = Project.get_service

  # assets dir
  public_dir = File.join(Dir.pwd,'public')
  
  FileUtils.cd(public_dir) do 
    flags = ''
    flags << ' --progress' unless options[:quiet]
    flags << ' --verbose' if options[:verbose]
    system "\"#{rb}\" --recursive #{flags} --public-read --make-dirs --exclude=\"^widgets/|\.(html|xml|txt|yml|md|doc|rb|java|cgi|fcgi)$\" ./ #{bucket}:#{path}"
  end
  
end
