#!/usr/bin/ruby
#
# this is a simple script that will compress the
# appcelerator JS file by aliasing long namespaced
# variables with shorter ones - at first attempt,
# this saves at least 15K in size
#

if ARGV.length != 2
  puts "Missing input argument" if ARGV.length < 1
  puts "Missing output argument" if ARGV.length < 2
  exit 1
end

infile = File.new(ARGV[0],"r")
outfile = File.new(ARGV[1],"w")

js = infile.read

# replace this globally scoped variables
js.gsub!(/window\./,'$$w.')
js.gsub!(/document\./,'$$d.')
js.gsub!(/navigator\./,'$$n.')

# make our shortcuts JS
declare=<<EOF
$$AU=Appcelerator.Util;
$$AC=Appcelerator.Compiler;
$$AD=Appcelerator.Decorator;
$$AL=Appcelerator.Localization;
$$AM=Appcelerator.Module;
$$AR=Appcelerator.Core;
$$AV=Appcelerator.Validator;
$$AF=Appcelerator.Config;
$$AB=Appcelerator.Browser;
EOF

# find the marker where we want to insert our shortcuts
idx = js.index('Appcelerator.Shortcuts={};')

# this is everything after our marker
post = js[idx+26,js.length]

# replace long variables after marker
post.gsub!(/Appcelerator\.Util\./,'$$AU.')
post.gsub!(/Appcelerator\.Compiler\./,'$$AC.')
post.gsub!(/Appcelerator\.Validator\./,'$$AV.')
post.gsub!(/Appcelerator\.Decorator\./,'$$AD.')
post.gsub!(/Appcelerator\.Core\./,'$$AR.')
post.gsub!(/Appcelerator\.Module\./,'$$AM.')
post.gsub!(/Appcelerator\.Localization\./,'$$AL.')
post.gsub!(/Appcelerator\.Config\./,'$$AF.')
post.gsub!(/Appcelerator\.Browser./,'$$AB.')

# we can do this at the top since they're global scope
outfile.print "$$w=window;"
outfile.print "$$d=document;"
outfile.print "$$n=navigator;"

# now chain it all together
outfile.print js[0,idx]
outfile.print declare.gsub("\n",'')
outfile.print post

exit 0