#!<%= rubypath %>
#
# Appcelerator Appcenter Server start/stop script
# <http://www.appcelerator.org>
#
#
if ['stop'].include? ARGV.first
  puts "Stopping <%= name %>..."
  system "mongrel_rails stop --chdir <%= workingdir %>"
end

if ['restart'].include? ARGV.first
  puts "Stopping <%= name %>..."
  system "mongrel_rails stop --chdir <%= workingdir %>"
  puts "Starting <%= name %>..."
  system "mongrel_rails start -d --chdir <%= workingdir %> -p <%= port %>"
end

if ['start'].include? ARGV.first
  puts "Starting <%= name %>..."
  system "mongrel_rails start -d --chdir <%= workingdir %> -p <%= port %>"
end

unless ['start', 'stop', 'restart'].include? ARGV.first
  puts "Usage: <%= name %> {start|stop|restart}"
  exit 1
end

exit 0