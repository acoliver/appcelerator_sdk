package org.appcelerator.test;

import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;

import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.IMessageDataList;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDataObjectException;
import org.appcelerator.messaging.MessageUtils;

public class TestManagerImpl implements TestManager{
	private long guidCounter=1;
	private HashMap<Long,Test> tests = new HashMap<Long,Test>();
	
	public Test create(String type, String details) {
		Test test = new Test();
		synchronized(this) {
			test.setId(guidCounter++);
		}
		test.setStart(System.currentTimeMillis());
		test.setStatus(Test.Status.Running);
		test.setType(type);
		test.setDetails(details);
		tests.put(test.getId(), test);
		return test;
	}

	public Collection<Test> get() {
		return tests.values();
	}
    public Test update(long id, String statusString, String details) {
    	Test test = tests.get(id);
    	Test.Status status = Test.Status.valueOf(statusString);
    	if (isTerminated(status)) {
    		end(test);
    	}
    	test.setStatus(status);
    	test.setDetails(details);
    	return test;
	}
	private void end(Test test) {
		long now = System.currentTimeMillis();
		test.setDuration(now - test.getStart());
	}	
    private boolean isTerminated(Test.Status status) {
    	return Test.Status.Completed.equals(status) || Test.Status.Failed.equals(status);
    }
    public void reset() {
    	tests = new HashMap<Long,Test>();
    	guidCounter=1;
    }
	@Service(request = "reset.test.reques", response = "reset.test.response", authenticationRequired = false)
    protected void reset (Message request, Message response) {
    	reset();
        response.getData().put("success", true);
    }
	@Service(request = "update.test.reques", response = "update.test.response", authenticationRequired = false)
    protected void update (Message request, Message response) throws MessageDataObjectException {
    	Test test = update(request.getData().getLong("id"),request.getData().getString("status"),request.getData().getString("details"));
    	response.getData().put("test", transform(test));
        response.getData().put("success", true);
    }

	@Service(request = "create.test.reques", response = "create.test.response", authenticationRequired = false)
    protected void create (Message request, Message response) throws MessageDataObjectException {
		Test test = create(request.getData().getString("type"),request.getData().getString("details"));
		response.getData().put("test", transform(test));
        response.getData().put("success", true);
	}	
    public static IMessageDataObject transform(Test test) {
    	IMessageDataObject result = MessageUtils.createMessageDataObject();
    	result.put("id", test.getId());
    	result.put("duration", test.getDuration());
    	result.put("start", test.getStart());
    	result.put("startDate", new Date(test.getStart()));
    	result.put("status", test.getStatus().toString());
    	result.put("details", test.getDetails());
    	result.put("type", test.getType());
		return result;
	}

	@Service(request = "get.test.reques", response = "get.test.response", authenticationRequired = false)
    protected void get (Message request, Message response) throws MessageDataObjectException {
		IMessageDataList<IMessageDataObject> result = MessageUtils.createMessageDataObjectList();
        for ( Iterator<Test> iterator = get().iterator(); iterator.hasNext(); )
        {
            Test test = iterator.next();
            result.add(transform(test));
        }
        response.getData().put("rows",result);
        response.getData().put("success", true);
    }	
	
}
