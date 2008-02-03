#
# create our appcelerator.rb file
#

RUBY_BIN=File.expand_path ARGV[0]
APPC_BIN=File.expand_path ARGV[1]

str=<<EOS
@ECHO OFF
@"#{RUBY_BIN}" "#{File.join(APPC_BIN,'appcelerator')}" %1 %2 %3 %4 %5 %6 %7 %8 %9
EOS


# 
# write out the batch file
#

f = File.open File.join(APPC_BIN,'appcelerator.bat'), 'w+'
f.puts str
f.flush
f.close
