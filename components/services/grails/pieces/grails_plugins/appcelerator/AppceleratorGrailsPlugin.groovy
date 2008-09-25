import org.appcelerator.annotation.Service
import org.codehaus.groovy.runtime.metaclass.*
import org.codehaus.groovy.runtime.metaclass.ClosureStaticMetaMethod

class AppceleratorGrailsPlugin {
    def version = 0.1
    def dependsOn = [:]

    def author = "Appcelerator, Inc."
    def authorEmail = ""
    def title = "Appcelerator"
    def description = "Appcelerator Grails service startup plugin"


    static def adapters = []

    def doWithApplicationContext = { applicationContext ->
        applicationContext.getBeanDefinitionNames().each { bean_name ->

            if (bean_name.endsWith("Service")) {
                println("bean: " + bean_name)
                def bean = applicationContext.getBean(bean_name)
                def methods = bean.getMetaClass().getMethods()
                for (i in 0..methods.size()) {
                    def m = methods[i]

                    if (m == null ||
                         m.class == ClosureMetaMethod.class ||
                         m.class == ClosureStaticMetaMethod.class)
                        continue

                    def a = m.cachedMethod.getAnnotation(Service.class)
                    if (a == null)
                        continue

                    a = new ServiceAdapter(
                        bean: bean,
                        method: m,
                        request: a.request(),
                        response: a.response()
                    )

                    if (!adapters.contains(a)) {
                        println("adding bean")
                        adapters << a
                    }

                }
            }
        }
    }

}

class Request {

}

class ServiceAdapter {
    def method
    def bean
    def request
    def response

    def equals = { o ->
        return o.method == this.method &&
                o.bean == this.bean &&
                o.request == this.request &&
                o.response == this.response
    }
}

class Message {
    def type
    def version
    def scope
    def data
    def serveletRequest
    def timestamp
}
