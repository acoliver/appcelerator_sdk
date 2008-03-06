

import junit.framework.TestCase;

import org.appcelerator.dispatcher.ServiceRegistry;

public class ServiceAdapterTest extends TestCase {
	public void testIt() throws Exception {
		ServiceImpl o = new ServiceImpl();
		o.post(null, null);
		ServiceRegistry.registerServiceMethods(ServiceImpl.class,false,null,null);
	}
}
