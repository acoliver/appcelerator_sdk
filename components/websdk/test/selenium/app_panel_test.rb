class PanelTest < Test::Unit::SeleniumTestCase
  include SeleniumHelper
   
  
    def initialize(name="panel test")
        return super(name)
    end

    def test_shade_unshade()
        open(url())
        mq('l:shade.panel')
        assert_alert("Test Passed Shade")
        
        mq('l:unshade.panel')
        assert_alert("Test Passed Unshade")
    end
    
    def test_open_close()
        open(url())
        mq('l:close.this.panel')
        assert_alert("Test Passed Close")
        
        mq('l:open.this.panel')
        assert_alert("Test Passed Open")
    end
    
    def page()
        return "/widget_tests/panel.html"
    end 
end