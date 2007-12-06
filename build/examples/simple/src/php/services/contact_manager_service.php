<?php 
	class ContactManagerService
	{
		/**
		 * this is a example service method
		 *
		 * @Service(request=example.createcontact.request,response=example.createcontact.response,version=1.0)
		 */
		function create_contact (&$request,&$response)
		{
			$data = &$response['data'];
			$requestdata = $request['data'];
			$data['id']='1001';
			$data['success']='true';
		}
	}
?>