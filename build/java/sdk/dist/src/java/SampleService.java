import org.apache.log4j.Logger;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.Message;


public class SampleService {
	private final static Logger LOG = Logger.getLogger(SampleService.class);
	@Service(request = "app.test.message.request", response = "app.test.message.response", authenticationRequired = false)
    protected void hello (Message request, Message response)
	{
		LOG.info("hello. you sent"+ request);
		
		response.getData().put("success", "true");
		response.getData().put("message", "I recieved from you "+ request.getData().optString("message"));
	}
}
