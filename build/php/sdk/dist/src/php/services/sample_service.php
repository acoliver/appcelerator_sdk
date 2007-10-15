<?php 
	class SampleService
	{
		/**
		 * this is a example service method
		 *
		 * @Service(request=app.test.message.request,response=app.test.message,version=1.0)
		 */
		public function myServiceMethod (&$request,&$response)
		{
			$data = &$response['data'];
			$requestdata = $request['data'];
			$data['message']='I recieved from you: ' . $requestdata['message'];
			$data['success']='true';
		}
	}
?>