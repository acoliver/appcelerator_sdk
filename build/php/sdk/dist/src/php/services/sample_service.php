<?php 
	class SampleService
	{
		/**
		 * this is a example service method
		 *
		 * @Service(request=app.test.message.request,response=app.test.message.response,version=1.0)
		 */
		public function myServiceMethod ($request,$response)
		{
			$data = &$response['data'];
			$message = &$request['message'];
			$data['message']='I recieved from you '+ $message;
			$data['success']='true';
		}
	}
?>