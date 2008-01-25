#!/usr/bin/ruby
#
# this is a simple script that will compress the
# appcelerator JS file by aliasing long namespaced
# variables with shorter ones - at first attempt,
# this saves at least 15K in size
#
require 'fileutils'
require 'ftools'

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
  puts file
    if file.index('-debug.').nil?
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
        dir=File.dirname(newfile)
        name=File.basename(newfile).gsub(".#{ext}",'')
        outname="#{dir}/#{name}-debug.#{ext}"
        # save off our original as a debug file
        File.copy(file,outname)
        system "java -jar #{JARFILE.path} --type #{ext} #{file} -o #{outname}.tmp"
    	f = File.new "#{outname}.tmp", "r"
    	js = f.read
        if ext == 'js'
    	   js.gsub!(/[^\$]\$\((.*)?\)/) do |m|
             m.gsub '$(', '$el('
           end
           js.gsub!(/\$\$\((.*)?\)/) do |m|
             m.gsub '$$(', '$sl('
           end
        end
    	of = File.new "#{newfile}", "w"
        # replace long variables after marker
        js.gsub!(/Appcelerator\.Util\./,'$$AU.') 
        js.gsub!(/Appcelerator\.Compiler\./,'$$AC.')
        js.gsub!(/Appcelerator\.Validator\./,'$$AV.')
        js.gsub!(/Appcelerator\.Decorator\./,'$$AD.')
        js.gsub!(/Appcelerator\.Core\./,'$$AR.')
        js.gsub!(/Appcelerator\.Module\./,'$$AM.')
        js.gsub!(/Appcelerator\.Localization\./,'$$AL.')
        js.gsub!(/Appcelerator\.Config\./,'$$AF.')
        js.gsub!(/Appcelerator\.Browser\./,'$$AB.')
    	of.puts js
    	File.delete f.path
    end
  end
end

#
# minimize all the JS and CSS files
#
minimize 'js'
minimize 'css'

exit 0
