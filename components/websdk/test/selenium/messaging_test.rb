class MessagingTest < Test::Unit::SeleniumTestCase
    include SeleniumHelper

    def test_message_sent
        open(url())
        add_message_listeners()
        mq('l:test.message')
        sleep 1
        assert(nil != get_message('r:send.message'))
    end
    
    def page()
       return '/misc/messaging.html' 
    end
end