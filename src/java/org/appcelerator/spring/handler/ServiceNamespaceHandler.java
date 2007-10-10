package org.appcelerator.spring.handler;

import org.springframework.beans.factory.support.BeanDefinitionBuilder;
import org.springframework.beans.factory.xml.AbstractSimpleBeanDefinitionParser;
import org.springframework.beans.factory.xml.NamespaceHandlerSupport;
import org.w3c.dom.Element;

public class ServiceNamespaceHandler extends NamespaceHandlerSupport {
	public ServiceNamespaceHandler() {
		registerBeanDefinitionParser("service", new SimpleBeanDefinitionParser());
	}
	public void init() {}
	private class SimpleBeanDefinitionParser extends AbstractSimpleBeanDefinitionParser {
	    protected Class getBeanClass(Element element) {
	      return ListenerBinding.class;
	    }
	    protected void postProcess(BeanDefinitionBuilder definitionBuilder,Element element) {
	    	String bean = element.getAttribute("bean");
	    	definitionBuilder.addPropertyReference("target", bean);
	    }
	}
}
