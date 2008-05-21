require 'json'
require 'fileutils'

class Selenium::SeleniumDriver
    def open(url)
        do_command("open", [url,])
        sleep 1
    end
end

class Test::Unit::SeleniumTestSuite < Test::Unit::TestSuite
    def initialize(name="Selenium Test", browser='firefox', basepath="http://appcelerator.org", screen_grab_location="")
        super(name)
        @browser = browser
        @basepath = basepath
        @screen_grab_location = screen_grab_location
    end
    
    attr_writer :browser, :basepath, :screen_grab_location
    
    def run(result, &progress_block)
      yield(STARTED, name)
      @tests.each do |test|
        test.browser = @browser
        test.basepath = @basepath
        test.screen_grab_location = @screen_grab_location
        test.run(result, &progress_block)
      end
      yield(FINISHED, name)
    end
end

class Test::Unit::SeleniumTestCase < Test::Unit::TestCase
    include SeleniumHelper
    
    attr_writer :browser, :basepath, :screen_grab_location
    
    def initialize(name="Selenium Test Case")
        super(name)
    end
    
    def self.suite
      method_names = public_instance_methods(true)
      tests = method_names.delete_if {|method_name| method_name !~ /^test./}
      suite = Test::Unit::SeleniumTestSuite.new(name)
      tests.sort.each do
        |test|
        catch(:invalid_test) do
          suite << new(test)
        end
      end
      if (suite.empty?)
        catch(:invalid_test) do
          suite << new("default_test")
        end
      end
      return suite
    end
    
    def run(result)
      yield(STARTED, name)
      @_result = result
      begin
        setup
        __send__(@method_name)
      rescue Test::Unit::AssertionFailedError => e
        add_failure(e.message, e.backtrace)
      rescue Exception
        raise if PASSTHROUGH_EXCEPTIONS.include? $!.class
        add_error($!)
      ensure
        begin
          teardown
        rescue Test::Unit::AssertionFailedError => e
          add_failure(e.message, e.backtrace)
        rescue Exception
          raise if PASSTHROUGH_EXCEPTIONS.include? $!.class
          add_error($!)
        end
      end
      result.add_run
      yield(FINISHED, name)
    end
    
    # Helper methods to make writing test cases for 
    # all this stuff a little cleaner
    
    def child_has_class(elem, class_name)
        text = get_eval("#{dollar(elem)}.select('[class=#{class_name}]')")
        return (text.length > 0)    
    end
    
    def mq(message_name, args = {})
        ret = get_eval("window.$MQ('#{message_name}', #{args.to_json})");
        return ret
    end
    
    def dollar(elem_id)
        return "$(window.document.getElementById('#{elem_id}'))"
    end

    def get_messages()
        messages = get_eval("window.Appcelerator.Selenium.get_messages()")
        JSON.parse(messages)
    end
    
    def get_message(name, attempts=1)
        while(attempts > 0)
            messages = get_messages()
            messages.each { |message| 
                msg_name = name[2..name.length]
                if message['type'] == msg_name
                    return message
                end
            }
            attempts -= 1
            sleep 1 if attempts > 0 
        end
        
        return nil
    end
    
    def assert_alert(alert_text)
        begin
          my_text = get_alert()
          assert_equal(alert_text, my_text)
        rescue SeleniumCommandError
          assert(false, "Alert expected but there were none")
        end
    end
    
    def clear_messages()
        return get_eval("window.Appcelerator.Selenium.clear_messages()")
    end
    
    def is_displayed(locator, idx=0)
        return get_eval(prototype_selector(locator,idx) + ".style.display != 'none'") == 'true'
    end
    
    def is_visible(locator, idx=0) 
        return get_eval(prototype_selector(locator,idx) + ".style.visible != 'none'") == 'true'
    end
    
    def get_style(locator, style_name, idx=0)
        return get_eval(prototype_selector(locator,idx) + ".getStyle('#{style_name}')")
    end
        
    def not_present(locator)
        return get_eval(prototype_selector(locator, 0)) == 'false'
    end
    
    def add_message_listeners
        javascript = <<END_OF_JAVASCRIPT
        window.Appcelerator.Selenium = {
            messages: new window.Array(),
            clear_messages: function() {
               window.Appcelerator.Selenium.messages.clear(); 
            },
            get_messages: function() {
                return window.Object.toJSON(window.Appcelerator.Selenium.messages);
            }
        };

        window.$MQL('l:~.*',function(type,msg,datatype,from)
        {
            window.Appcelerator.Selenium.messages.push(
            {
               'type': type,
               'msg': msg,
               'datatype': datatype,
               'from': from 
            });
        });

        window.$MQL('r:~.*',function(type,msg,datatype,from)
        {
            window.Appcelerator.Selenium.messages.push(
            {
               'type': type,
               'msg': msg,
               'datatype': datatype,
               'from': from 
            });
        });
END_OF_JAVASCRIPT
        ret = get_eval(javascript)
    end
    
    def screen_shot(name)
        FileUtils.mkdir_p("#{@screen_grab_location}/", :verbose => true)
        capture_screenshot("#{@screen_grab_location}/#{name}")
    end
    
    def url()
        return "#{@basepath}#{page()}"
    end
    
    def setup
        @selenium = Selenium::SeleniumDriver.new("localhost", 4444,
    		"*#{@browser}", "#{@basepath}/", 15000)
    	@selenium.start
    	@selenium.open(url())
    	add_message_listeners()
    end
    
	def teardown
		@selenium.stop
	end
	
	
    def prototype_selector(str, idx)
        # try to be smart, if there is a hash, assume prototype locator
        # otherwise just use dollar
        
        if(str.include?('#'))
            return "window.$$('#{str}').length > 0 && window.$$('#{str}')[#{idx}]"
        else
            return "window.$('#{str}')"
        end
    end
end