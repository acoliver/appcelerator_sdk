Title: Simple Example

This is a simple example that uses the `<app:stopwatch>`.
	
Responding to events: 

    <a on="click then l:stopwatch_toggle">Toggle</a> <a on="click then l:stopwatch_reset">Reset</a>
    <app:stopwatch on="l:stopwatch_toggle then start_stop or l:stopwatch_reset then clear_time" show_button="false"></app:stopwatch>