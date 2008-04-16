#
# JSON Pure Library by Florian Frank <flori@ping.de>
#
# Download source/binary from http://json.rubyforge.org/
#
# Ruby License, see the RUBY file included in the source distribution. The Ruby
# License includes the GNU General Public License (GPL), Version 2, so see the
# file GPL as well.

require 'strscan'

module JsonConst
  string                = /" ((?:[^\x0-\x1f"\\] |
                              \\["\\\/bfnrt] |
                              \\u[0-9a-fA-F]{4} |
                              \\[\x20-\xff])*)
                          "/nx
  integer               = /(-?0|-?[1-9]\d*)/
  float                 = /(-?
                            (?:0|[1-9]\d*)
                            (?:
                              \.\d+(?i:e[+-]?\d+) |
                              \.\d+ |
                              (?i:e[+-]?\d+)
                            )
                            )/x
  nan                   = /NaN/
  infinity              = /Infinity/
  minus_infinity        = /-Infinity/
  object_open           = /\{/
  object_close          = /\}/
  array_open            = /\[/
  array_close           = /\]/
  pair_delimiter        = /:/
  collection_delimiter  = /,/
  _true                  = /true/
  _false                 = /false/
  null                  = /null/
  ignore                = %r(
    (?:
     //[^\n\r]*[\n\r]| # line comments
     /\*               # c-style comments
     (?:
      [^*/]|        # normal chars
      /[^*]|        # slashes that do not start a nested comment
      \*[^/]|       # asterisks that do not end this comment
      /(?=\*/)      # single slash before this comment's end 
     )*
       \*/               # the End of this comment
       |[ \t\r\n]+       # whitespaces: space, horicontal tab, lf, cr
    )+
  )mx

  unparsed = Object.new
  
  # Unescape characters in strings.
  unescape_map = Hash.new { |h, k| h[k] = k.chr }
  unescape_map.update({
    ?"  => '"',
    ?\\ => '\\',
    ?/  => '/',
    ?b  => "\b",
    ?f  => "\f",
    ?n  => "\n",
    ?r  => "\r",
    ?t  => "\t",
    ?u  => nil, 
  })
end

module JSON
  module Pure
    # This class implements the JSON parser that is used to parse a JSON string
    # into a Ruby data structure.
    class Parser < StringScanner

      # Creates a new JSON::Pure::Parser instance for the string _source_.
      #
      # It will be configured by the _opts_ hash. _opts_ can have the following
      # keys:
      # * *max_nesting*: The maximum depth of nesting allowed in the parsed data
      #   structures. Disable depth checking with :max_nesting => false|nil|0,
      #   it defaults to 19.
      # * *allow_nan*: If set to true, allow NaN, Infinity and -Infinity in
      #   defiance of RFC 4627 to be parsed by the Parser. This option defaults
      #   to false.
      # * *create_additions*: If set to false, the Parser doesn't create
      #   additions even if a matchin class and create_id was found. This option
      #   defaults to true.
      def initialize(source, opts = {})
        super
        if !opts.key?(:max_nesting) # defaults to 19
          @max_nesting = 19
        elsif opts[:max_nesting]
          @max_nesting = opts[:max_nesting]
        else
          @max_nesting = 0
        end
        @allow_nan = !!opts[:allow_nan]
        ca = true
        ca = opts[:create_additions] if opts.key?(:create_additions)
        @create_id = ca ? JSON.create_id : nil
      end

      alias source string

      # Parses the current JSON string _source_ and returns the complete data
      # structure as a result.
      def parse
        reset
        obj = nil
        until eos?
          case
          when scan(JsonConst.object_open)
            obj and raise ParserError, "source '#{peek(20)}' not in JSON!"
            @current_nesting = 1
            obj = parse_object
          when scan(JsonConst.array_open)
            obj and raise ParserError, "source '#{peek(20)}' not in JSON!"
            @current_nesting = 1
            obj = parse_array
          when skip(IGNORE)
            ;
          else
            raise ParserError, "source '#{peek(20)}' not in JSON!"
          end
        end
        obj or raise ParserError, "source did not contain any JSON!"
        obj
      end

      private

      def parse_string
        if scan(JsonConst.string)
          return '' if self[1].empty?
          self[1].gsub(%r((?:\\[\\bfnrt"/]|(?:\\u(?:[A-Fa-f\d]{4}))+|\\[\x20-\xff]))n) do |c|
            if u = JsonConst.unescape_map[c[1]]
              u
            else # \uXXXX
              bytes = ''
              i = 0
              while c[6 * i] == ?\\ && c[6 * i + 1] == ?u 
                bytes << c[6 * i + 2, 2].to_i(16) << c[6 * i + 4, 2].to_i(16)
                i += 1
              end
              JSON::UTF16toUTF8.iconv(bytes)
            end
          end
        else
          JsonConst.unparsed
        end
      rescue Iconv::Failure => e
        raise GeneratorError, "Caught #{e.class}: #{e}"
      end

      def parse_value
        case
        when scan(JsonConst.float)
          Float(self[1])
        when scan(JsonConst.integer)
          Integer(self[1])
        when scan(JsonConst._true)
          true
        when scan(JsonConst._false)
          false
        when scan(JsonConst.null)
          nil
        when (string = parse_string) != JsonConst.unparsed
          string
        when scan(JsonConst.array_open)
          @current_nesting += 1
          ary = parse_array
          @current_nesting -= 1
          ary
        when scan(JsonConst.object_open)
          @current_nesting += 1
          obj = parse_object
          @current_nesting -= 1
          obj
        when @allow_nan && scan(JsonConst.nan)
          NaN
        when @allow_nan && scan(JsonConst.infinity)
          Infinity
        when @allow_nan && scan(JsonConst.minus_infinity)
          MinusInfinity
        else
          JsonConst.unparsed
        end
      end

      def parse_array
        raise NestingError, "nesting of #@current_nesting is to deep" if
          @max_nesting.nonzero? && @current_nesting > @max_nesting
        result = []
        delim = false
        until eos?
          case
          when (value = parse_value) != JsonConst.unparsed
            delim = false
            result << value
            skip(JsonConst.ignore)
            if scan(JsonConst.collection_delimiter)
              delim = true
            elsif match?(JsonConst.array_close)
              ;
            else
              raise ParserError, "expected ',' or ']' in array at '#{peek(20)}'!"
            end
          when scan(JsonConst.array_close)
            if delim
              raise ParserError, "expected next element in array at '#{peek(20)}'!"
            end
            break
          when skip(JsonConst.ignore)
            ;
          else
            raise ParserError, "unexpected token in array at '#{peek(20)}'!"
          end
        end
        result
      end

      def parse_object
        raise NestingError, "nesting of #@current_nesting is to deep" if
          @max_nesting.nonzero? && @current_nesting > @max_nesting
        result = {}
        delim = false
        until eos?
          case
          when (string = parse_string) != JsonConst.unparsed
            skip(JsonConst.ignore)
            unless scan(JsonConst.pair_delimiter)
              raise ParserError, "expected ':' in object at '#{peek(20)}'!"
            end
            skip(JsonConst.ignore)
            unless (value = parse_value).equal? JsonConst.unparsed
              result[string] = value
              delim = false
              skip(JsonConst.ignore)
              if scan(JsonConst.collection_delimiter)
                delim = true
              elsif match?(JsonConst.object_close)
                ;
              else
                raise ParserError, "expected ',' or '}' in object at '#{peek(20)}'!"
              end
            else
              raise ParserError, "expected value in object at '#{peek(20)}'!"
            end
          when scan(JsonConst.object_close)
            if delim
              raise ParserError, "expected next name, value pair in object at '#{peek(20)}'!"
            end
            if @create_id and klassname = result[@create_id]
              klass = JSON.deep_const_get klassname
              break unless klass and klass.json_creatable?
              result = klass.json_create(result)
            end
            break
          when skip(JsonConst.ignore)
            ;
          else
            raise ParserError, "unexpected token in object at '#{peek(20)}'!"
          end
        end
        result
      end
    end
  end
  def JSON.parse(str)
    p = JSON::Pure::Parser.new str,{:create_additions=>false}
    p.parse
  end
end


