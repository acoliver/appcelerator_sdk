require 'fileutils'

STAGE_DIR = ARGV[0]

FileUtils.mkdir_p("#{STAGE_DIR}/tmp", :verbose => true)
File.open("#{STAGE_DIR}/tmp/webrick.pid", "w") { |file| file.puts( Process.pid ) }
require 'webrick'
include WEBrick
logger = Log.new("#{STAGE_DIR}/tmp/webrick.log")
logger.level = Log::WARN
access_log = [ [ File.open("#{STAGE_DIR}/tmp/webrick.log", "w"), AccessLog::COMBINED_LOG_FORMAT ] ]
s = HTTPServer.new(
    :Logger => logger,
    :AccessLog => access_log,
    :Port            => 9002,
    :DocumentRoot    => "#{STAGE_DIR}/unittest"
)

trap(15){ s.shutdown }
s.start