import org.apache.log4j.Logger;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.Message;

public class ContactManager {
	private final static Logger LOG = Logger.getLogger(ContactManager.class);
	@Service(request = "example.createcontact.request", response = "example.createcontact.response", authenticationRequired = false)
    protected void createContact (Message request, Message response)
	{
		response.getData().put("success", "true");
		//mock implementation
		response.getData().put("id", "1001");
	}
}
