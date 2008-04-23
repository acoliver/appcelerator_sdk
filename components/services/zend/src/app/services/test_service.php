<?php 
	class TestService
	{
		/**
		 * this is a test service
		 *
		 * @Service(request=app.test.message.request,response=app.test.message.response,version=1.0)
		 */
		function myServiceMethod ($request, $response)
		{
            $response->data['message'] = 'I received from you: ' . $request->data['message'];
            $response->data['success'] = 'true';
		}
	}
?>
