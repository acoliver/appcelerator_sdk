# require 'fileutils'
# 
# FileUtils.mkdir_p("#{STAGE_DIR}/tmp", :verbose => true)
# tmp_path = "#{STAGE_DIR}/tmp"
# logfile = File.new("#{tmp_path}/selenium.log", File::CREAT|File::TRUNC|File::WRONLY)
# IO.popen("java -jar #{BUILD_DIR}/test/lib/selenium-server.jar") do |out| 
#   until out.eof?
#     logfile.puts out.gets
#   end
# end