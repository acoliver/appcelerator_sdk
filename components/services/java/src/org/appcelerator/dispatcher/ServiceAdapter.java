package org.appcelerator.dispatcher;

import org.appcelerator.annotation.Service;
import org.appcelerator.dispatcher.ServiceDescription;
import org.appcelerator.messaging.Message;

/**
 * An interface describing a service adapter. The ServiceRegistry
 * should dispatch Appcelerator requests to one of these.
 * 
 * @author Martin Robinson <mrobinson@appcelerator.com>
 *
 */
public interface ServiceAdapter {

	public abstract boolean equals(Object obj);

	public abstract int hashCode();

	/**
	 * call the service
	 * 
	 * @param request
	 * @param response
	 */
	public abstract void dispatch(Message request, Message response);

	/**
	 * return the service description for the service method
	 * @return
	 */
	public ServiceDescription getService();
	
	/**
	 * Check whether these adapters are equivalent for the
	 * purposes of preventing duplicates in the dispatcher.
	 * @param sa the service adapter to compare to
	 * @return true if the adapters are equal, false otherwise
	 */
    public boolean is(ServiceAdapter sa);

}