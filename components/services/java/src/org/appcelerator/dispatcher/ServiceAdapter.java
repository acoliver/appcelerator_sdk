package org.appcelerator.dispatcher;

import org.appcelerator.messaging.Message;

/**
 * An interface describing a service adapter. The ServiceRegistry
 * should dispatch Appcelerator requests to one of these.
 * 
 * @author Martin Robinson <mrobinson@appcelerator.com>
 *
 */
public abstract class ServiceAdapter {

    protected String request = "";
    protected String response = "";
    protected String version = "";
    

	/**
	 * call the service
	 * 
	 * @param request
	 * @param response
	 */
	public abstract void dispatch(Message request, Message response);

	/**
	 * Check whether these adapters are equivalent for the
	 * purposes of preventing duplicates in the dispatcher.
	 * @param sa the service adapter to compare to
	 * @return true if the adapters are equal, false otherwise
	 */
    public abstract boolean is(ServiceAdapter sa);
    
    public boolean equals(Object o) {
        if (!(o instanceof ServiceAdapter))
            return false;
        
        ServiceAdapter a = (ServiceAdapter) o;
        
        if (a.request.equals(this.request) &&
            a.response.equals(this.response) &&
            a.version.equals(this.version)) {
            return true;
        }
        return false;
    }

    public int hashCode() {
        return request.hashCode() * response.hashCode() * version.hashCode();
    }

    /**
     * @return the request
     */
    public String getRequest() {
        return request;
    }

    /**
     * @return the response
     */
    public String getResponse() {
        return response;
    }

    /**
     * @return the version
     */
    public String getVersion() {
        return version;
    }

}