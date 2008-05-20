class CalendarTest < Test::Unit::SeleniumTestCase
    include SeleniumHelper

    def test_calendar() 
       calendar = 'app_calendar_0'
       calendar_cell = 'app_calendar_0_cal_cell11'
       input_id = 'jobfilter_date_start' 
       
       assert(!is_displayed(calendar))
       assert(get_value(input_id).length == 0)
       
       mq('l:calendarexample.start')
       assert(is_displayed(calendar))
       
       click(calendar_cell)
       assert(get_value(input_id).length > 0)
    end
    
    def page()
       return '/widget_tests/calendar.html' 
    end
end