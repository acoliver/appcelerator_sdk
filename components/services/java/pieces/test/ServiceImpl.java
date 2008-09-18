import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.Message;


public class ServiceImpl extends AbstractService{
	
	@Service (request="blah",response="blhh",premessage="pre",postmessage="post")
	public void process(Message req, Message resp) {
		
	}

}
