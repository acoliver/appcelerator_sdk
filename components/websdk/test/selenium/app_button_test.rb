
class ButtonTest < Test::Unit::SeleniumTestCase
  include SeleniumHelper
  @@widget = "button.html"
  
    def initialize(name="yousuck")
        return super(name)
    end
		
	def test_clicking
	    url = "#{@basepath}/#{@@widget}"
        open(url)
        click("app_7")
        alert_text = get_alert()
        assert_equal("test passed", alert_text)
	end
	
	def test_greenicon
        url = "#{@basepath}/#{@@widget}"
        elem = "button_green_icon_test"
        open(url)
        click(elem)
        alert_text = get_alert()
        assert_equal("test passed", alert_text)
        text = get_eval("#{dollar(elem)}.select('[class=button_icon_add_green]')")
        assert(text.length > 0)
	end
  
    def dollar(elem_id)
        return "$(window.document.getElementById('#{elem_id}'))"
    end
  
	def teardown
		@selenium.stop
	end
end