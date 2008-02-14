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

#
# we're going to redefine the use of $ so that it doesn't conflict
# with other libraries such as jQuery. This means internally what's compiled
# is the $el and not $.  If you use $ outside of appcelerator you should use
# $el for maximum compatability with other libraries.
#
js.gsub!(/function \$\(\)/,'function $el()')
js.gsub!(/function \$\$\(\)/,'function $sl()')
 
js.gsub!(/[^\$]\$\((.*?)\)/) do |m|
  m.gsub '$(', '$el('
end
js.gsub!(/\$\$\((.*?)\)/) do |m|
  m.gsub '$$(', '$sl('
end

js.gsub!(/\$D\([^\)]/) do |m|
  "if (Logger.debugEnabled) #{m}"
end

# replace this globally scoped variables
js.gsub!(/window\./,'$$w.')
js.gsub!(/document\./,'$$d.')
js.gsub!(/navigator\./,'$$n.')
js.gsub!(/Object\./,'$$o.')
js.gsub!(/Logger\./,'$$l.')

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
post.gsub!(/Appcelerator\.Browser\./,'$$AB.')

# we can do this at the top since they're global scope
outfile.print "$$w=window;"
outfile.print "$$d=document;"
outfile.print "$$n=navigator;"
outfile.print "$$o=Object;"

# now chain it all together
outfile.print js[0,idx]
outfile.print declare.gsub("\n",'')
outfile.print post

# define our $ if jQuery isn't defined
# we want to be able to support both jQuery and Prototype being loaded at the same time w/o conflict
epilog=<<END
  ; if (typeof(jQuery)=='undefined'){$ = $el; $$w.$ = $el; $$ = $sl; $$w.$$ = $sl;}
END

outfile.print epilog

puts "compressed #{infile.path} => #{outfile.path}"

exit 0