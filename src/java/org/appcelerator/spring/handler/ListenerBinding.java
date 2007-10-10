package org.appcelerator.spring.handler;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.appcelerator.messaging.Message;


public class ListenerBinding {
	private String bean;
	private String request;
	private String response;
	private String method;
	private Object target;
	public Object getTarget() {
		return target;
	}
	public void setTarget(Object target) {
		this.target = target;
	}
	private Method getMethod1() {
		Method[] methods = target.getClass().getMethods();
		for (int i=0;i<methods.length;i++) {
			if (method.equals(methods[i].getName()))
				return methods[i];
		}
		return null;
	}
	public void invoke(Message request, Message response) throws IllegalArgumentException, IllegalAccessException, InvocationTargetException {
		Method method = getMethod1();
		method.invoke(target,request,response);
	}

	public String getBean() {
		return bean;
	}

	public void setBean(String bean) {
		this.bean = bean;
	}

	public String getRequest() {
		return request;
	}

	public void setRequest(String request) {
		this.request = request;
	}

	public String getResponse() {
		return response;
	}

	public void setResponse(String response) {
		this.response = response;
	}

	public String getMethod() {
		return method;
	}

	public void setMethod(String method) {
		this.method = method;
	}
}
