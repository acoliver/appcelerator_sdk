#!/usr/bin/ruby
#
# this is a simple script that will compress the
# appcelerator JS file by aliasing long namespaced
# variables with shorter ones - at first attempt,
# this saves at least 15K in size
#
require 'fileutils'

if ARGV.length != 3
  puts "Missing input argument" if ARGV.length < 1
  puts "Missing output argument" if ARGV.length < 2
  puts "Missing jar argument" if ARGV.length < 3
  exit 1
end

INDIR = Dir.new(ARGV[0])
OUTDIR = Dir.new(ARGV[1])
JARFILE = File.new(ARGV[2])

def minimize(ext)
  Dir.glob(File.join(INDIR.path,'**',"*.#{ext}")).each do |file|
    pathname = file[INDIR.path.length+1,file.length]
    modulename = pathname[0,pathname.index('/')]
    filename = pathname[pathname.index('/')+1,pathname.length]
    idx = filename.index('/')
    dir = '/'
    if idx
      dir = '/' + filename[0,idx]
      filename = filename[idx+1,filename.length]
    end
    newdir = "#{OUTDIR.path}/#{modulename}#{dir}"
    FileUtils.mkdir_p(newdir)
    newfile = File.join(newdir,filename)
    puts "Minimizing #{file} -> #{newfile}"
    system "java -jar #{JARFILE.path} --type #{ext} #{file} -o #{newfile}" 
  end
end

#
# minimize all the JS and CSS files
#
minimize 'js'
minimize 'css'

exit 0
