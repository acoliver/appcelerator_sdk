class PanelTest < Test::Unit::SeleniumTestCase
  include SeleniumHelper
   
    def initialize(name="panel test")
        return super(name)
    end

    def test_shade_unshade()
        mq('l:shade.panel')
        sleep 1
        assert_alert("Test Passed Shade")
        
        mq('l:unshade.panel')
        sleep 1
        assert_alert("Test Passed Unshade")
    end
    
    def test_open_close()
        mq('l:close.this.panel')
        sleep 1
        assert_alert("Test Passed Close")
        
        mq('l:open.this.panel')
        sleep 1
        assert_alert("Test Passed Open")
    end
    
    def page()
        return "/widget_tests/panel.html"
    end 
end