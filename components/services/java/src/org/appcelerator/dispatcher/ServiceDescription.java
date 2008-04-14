package org.appcelerator.dispatcher;

import java.io.Serializable;

import org.appcelerator.annotation.Service;

public class ServiceDescription implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	private String request;
	private String response;
	private String version;
	private String premessage;
	private String postmessage;
	
	public ServiceDescription(Service service) {
		this.request = service.request();
		this.response = service.response();
		this.version = service.version();
		this.premessage = service.premessage();
		this.postmessage = service.postmessage();
	}
	
	
	public ServiceDescription(String request, String response, String version, String premessage, String postmessage) {
		this.request = request;
		this.response = response;
		this.version = version;
		this.premessage = premessage;
		this.postmessage = postmessage;
	}
	
	public boolean equals(Object o) {
	    
	    if (o instanceof ServiceDescription) {
	        
	        ServiceDescription sd = (ServiceDescription) o;
	        if (sd.request.equals(this.request)
	                && sd.response.equals(this.response)
	                && sd.version.equals(this.version))
	            return true;
	    }
	    
	    return false;
	}
	
    /**
     * service request name
     * 
     * @return
     */
    public String request() {
    	return request;
    }
    
    /**
     * service response name or null/empty string for no response
     * 
     * @return
     */
    public String response() {
    	return response;
    }
    
    /**
     * service version (defaults to 1.0)
     * 
     * @return
     */
    public String version() {
    	return version;
    }

	/** 
	 * method which will be invoked before the service is handled. 	the method must take two
	 * parameters of Message type. The first is the incoming message, the second is the outgoing response.
	 */
    public String premessage() {
    	return premessage;
    }

	/** 
	 * method which will be invoked after the service is handled. the method must take two
	 * parameters of Message type. The first is the incoming message, the second is the outgoing response.
	 */
    public String postmessage() {
    	return postmessage;
    }
}
