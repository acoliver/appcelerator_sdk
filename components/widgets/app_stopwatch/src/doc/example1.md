Title: Simple Example

++example
<app:stopwatch></app:stopwatch>
--example	
	
Instead of using the buttons you can have the stopwatch respond to events: 

++example
<a on="click then l:stopwatch_toggle">Toggle</a> <a on="click then l:stopwatch_reset">Reset</a>
<app:stopwatch on="l:stopwatch_toggle then start_stop or l:stopwatch_reset then clear_time" show_button="false"></app:stopwatch>
--example