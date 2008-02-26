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

#
# command: help
#
# prints out the help information for all available commands 
# or for an individual command
#

Appcelerator::CommandRegistry.registerCommand('help','gets help for all the supported commands',[
  {
    :name=>'command',
    :help=>'get help for a specific command',
    :required=>false,
    :default=>nil,
    :type=>Appcelerator::Types::AlphanumericType
  }
],nil,nil) do |args,options|

  success = true
  
  entry = Appcelerator::CommandRegistry.find(args[:command])
  if args[:command] and not entry
    STDERR.puts " *ERROR: Invalid command: #{args[:command]}"
    success=false
  end
  
  puts 
  puts 'Appcelerator RIA Platform'.center(80)
  puts 
  puts "  This program comes with ABSOLUTELY NO WARRANTY; for details type "
  puts "  `#{SCRIPTNAME} help:license`. This is free software, and you are welcome to "
  puts "  redistribute it under certain conditions of the GNU GPL version 3 license."
  puts
  
  if entry
    puts 
    puts "    #{args[:command]} => #{entry[:help]}"
    puts 
    astr = entry[:args].nil? ? '' : entry[:args].map {|a| a[:required] ? "[#{a[:name]}]" : "<#{a[:name]}>" }.join(' ')
    astr = "[options...] #{astr}" if args[:opts]
    puts "    Usage:"
    puts "      #{SCRIPTNAME} #{args[:command]} #{astr}"
    puts
    if entry[:args]
      puts "    Supported arguments:"
      entry[:args].each do |a|
          n = a[:name]
          msg = a[:help]
          msg<<'  (optional)' unless a[:required]
          puts "      #{n}" + (" "*(20-n.length)) + "#{msg}"
      end
    end
    puts
    puts "    Supported options:"
    HELP.keys.each do |k|
        v = HELP[k]
        msg = v[:help]
        n = v[:display]
        puts "      #{n}" + (" "*(20-n.length)) + "#{msg}" if msg
    end
    if entry[:examples]
        puts 
        puts "    Examples:"
        entry[:examples].each do |example|
            puts "      #{example}"
        end
    end
  else
    puts "    Usage:"
    puts
    puts "        #{SCRIPTNAME} -h/--help"
    puts "        #{SCRIPTNAME} command [arguments...] [options...]"
    puts
    puts "    Examples:"
    puts
    puts "        #{SCRIPTNAME} create:project ~/myproject foobar java --verbose"
    puts "        #{SCRIPTNAME} install:plugin foo:bar"
    puts
    puts "    For supported commands, use:"
    puts
    puts "        #{SCRIPTNAME} help:commands"
    puts
    puts "    For command-specific help, use:"
    puts
    puts "        #{SCRIPTNAME} help [command]"
  end
  puts
  success
end

Appcelerator::CommandRegistry.registerCommand('help:commands','get information on all the supported commands',nil,nil,nil) do |args,options|
  puts 
  puts 'Appcelerator RIA Platform'.center(80)
  puts 
  puts "  This program comes with ABSOLUTELY NO WARRANTY; for details type "
  puts "  `#{SCRIPTNAME} help:license`. This is free software, and you are welcome to "
  puts "  redistribute it under certain conditions of the GNU GPL version 3 license."
  puts
  puts "    Supported commands:"
  puts
  current = nil

  Appcelerator::CommandRegistry.each do |name,entry|
    help = entry[:help]
    n = name.split(':')[0]
    puts if current and current!=n
    puts "       #{name}" + (" "*(20-name.length)) + "#{help}"
    current = n
  end
  true
end


Appcelerator::CommandRegistry.registerCommand('help:license','gets license details for this software',nil,nil,nil) do |args,options|
  license = File.expand_path "#{File.dirname(__FILE__)}/templates/COPYING"
  system "less \"#{license}\""
  true
end

Appcelerator::CommandRegistry.registerCommand('help:about','gets details about this software',nil,nil,nil) do |args,options|
  puts
  puts "Glad you asked....  THANK YOU for using Appcelerator. We love you!"
  puts
  puts "Appcelerator was created by Jeff Haynie and Nolan Wright in 2006 "
  puts "and released as an open source project in 2007. For more information,"
  puts "please visit our developer community at http://www.appcelerator.org"
  puts
  puts "If you'd like to get additional assistance using Appcelerator or "
  puts "professional support, training or alternative licensing options - please"
  puts "email sales@appcelerator.com or visit http://www.appcelerator.com."
  puts
  true
end




