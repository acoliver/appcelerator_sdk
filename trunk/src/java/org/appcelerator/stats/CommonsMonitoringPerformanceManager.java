package org.appcelerator.stats;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Collection;
import java.util.Iterator;

import org.apache.commons.monitoring.Counter;
import org.apache.commons.monitoring.Monitor;
import org.apache.commons.monitoring.Monitoring;
import org.apache.commons.monitoring.Repository;
import org.apache.commons.monitoring.StatValue;
import org.apache.commons.monitoring.Monitor.Key;
import org.apache.commons.monitoring.impl.DefaultRepository;
import org.apache.commons.monitoring.reporting.JsonRenderer;
import org.apache.commons.monitoring.reporting.Renderer;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.IMessageDataList;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.messaging.RawMessageDataList;

public class CommonsMonitoringPerformanceManager implements PerformanceManager {

	public CommonsMonitoringPerformanceManager() {
		setRepository(new DefaultRepository());
	}
	public Statistic createStat(Message message) {
		return new StopWatchStatistic(Monitoring.start(message.getType()),message.getType());
	}

	public void publish(Statistic stat) {
		stat.end();
	}
	public Repository getRepository() {
		return Monitoring.getRepository();
	}

	public void setRepository(Repository repository) {
		Monitoring.setRepository(repository);
	}
	@Service(request = "monitor.performance.request", response = "monitor.performance.response", authenticationRequired = false)
    protected void monitor (Message request, Message response) {
		Collection monitors = Monitoring.getRepository().getMonitors();
		IMessageDataList<IMessageDataObject> result = render(monitors);
		response.getData().put("monitors", result);
        response.getData().put("success", true);
    }
	@Service(request = "monitorold.performance.request", response = "monitorold.performance.response", authenticationRequired = false)
    protected void monitorold (Message request, Message response) {
		StringWriter out = new StringWriter();
        Renderer renderer = new JsonRenderer( new PrintWriter( out ), Renderer.DEFAULT_ROLES );
		Collection monitors = Monitoring.getRepository().getMonitors();
        renderer.render( monitors );
        RawMessageDataList toJson = new RawMessageDataList(out.toString());
        response.getData().put("monitors", toJson);
        response.getData().put("success", true);
    }
	@Service(request = "reset.performance.request", response = "reset.performance.response", authenticationRequired = false)
	protected void reset (Message request, Message response) {
    	Monitoring.getRepository().reset();
		response.getData().put("success", true);
    }
    public IMessageDataList<IMessageDataObject> render( Collection<Monitor> monitors )
    {
		IMessageDataList<IMessageDataObject> result = MessageUtils.createMessageDataObjectList();
        for ( Iterator<Monitor> iterator = monitors.iterator(); iterator.hasNext(); )
        {
            Monitor monitor = iterator.next();
            result.add(render( monitor ));
        }
        return result;
    }

    public IMessageDataObject render( Monitor monitor )
    {
    	IMessageDataObject result =MessageUtils.createMessageDataObject();
    	Key monitorkey = monitor.getKey();
    	IMessageDataObject key = render(monitorkey);
        result.put("key", key);
        
    	for ( Iterator<String> iterator = monitor.getRoles().iterator(); iterator.hasNext(); )
        {
            String role = iterator.next();
            IMessageDataObject value = render( monitor.getValue( role ), role );
            result.put(role, value);
        }
    	return result;
    }
	private IMessageDataObject render(Key monitorkey) {
		IMessageDataObject key =MessageUtils.createMessageDataObject();
    	key.put("name", monitorkey.getName());
        if ( monitorkey.getCategory() != null )
        	key.put("category", monitorkey.getCategory());
        if ( monitorkey.getSubsystem() != null )
        	key.put("subsystem", monitorkey.getSubsystem());
		return key;
	}

    public IMessageDataObject render( StatValue value, String role )
    {
    	IMessageDataObject stat =MessageUtils.createMessageDataObject();
    	putValue(stat,"value",value.getMin());
    	putValue(stat,"max",value.getMax());
    	putValue(stat,"min",value.getMin());
    	putValue(stat,"stdDev",value.getStandardDeviation());
    	putValue(stat,"mean",value.getMean());
        if ( value instanceof Counter ) {
            Counter counter = (Counter) value;
            putValue(stat,"total", counter.getSum());
            putValue(stat,"hits", counter.getHits());
        }
        return stat;
    }
    private void putValue(IMessageDataObject data,String name, long value) {
		data.put(name, value);
    }
    private void putValue(IMessageDataObject data,String name, Double value) {
    	if (value.isNaN())
    		data.put(name, "NaN");
    	else
    		data.put(name, value);
    }
}
