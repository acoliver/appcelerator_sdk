# Appcelerator SDK
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#
#===============================================================================

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
  puts ' Appcelerator Platform SDK'
  puts 
  
  if entry
    astr = entry[:args].map {|a| "[#{a[:name]}]" }.join(' ')
    astr = "[options...] #{astr}" if args[:opts]
    puts "    Usage for #{args[:command]}:"
    puts "      #{SCRIPTNAME} #{args[:command]} #{astr}"
    puts
    puts "    Supported arguments:"
    entry[:args].each do |a|
        n = a[:name]
        msg = a[:help]
        puts "      #{n}" + (" "*(15-n.length)) + "#{msg}"
    end
    if entry[:opts]
        puts
        puts "    Supported options:"
        args[:opts].each do |a|
            n = a[:name]
            msg = a[:help]
            puts "      #{n}" + (" "*(15-n.length)) + "#{msg}"
        end
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
    puts "      #{SCRIPTNAME} -h/--help"
    puts "      #{SCRIPTNAME} -v/--version"
    puts "      #{SCRIPTNAME} command [arguments...] [options...]"
    puts
#    puts "    Examples:"
#    puts "      #{SCRIPTNAME} install mypath"
#    puts "      #{SCRIPTNAME} compile myfile.html output --recursive"
#    puts "      #{SCRIPTNAME} verify module mymodule.js"
#    puts
    puts "    Supported commands:"
    Appcelerator::CommandRegistry.each do |name,entry|
      help = entry[:help]
      puts "      #{name}" + (" "*(15-name.length)) + "#{help}"
    end
  end
  puts
  success
end






Appcelerator::Installer.install_ruby_gems_if_needed
