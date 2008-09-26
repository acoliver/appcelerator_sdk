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
    static def getAdapters(message ->
        def messageAdapters = []
        adapters.each { adapter ->
            def version = adapter.version
            if (adapter.request == message.type &&
                (version == null ||
                 version == "" ||
                 version == message.version))
                messageAdapters << adapters
        }
        return messageAdapters
    }

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
                        requestType: a.request(),
                        responseType: a.response(),
                        version: a.version()
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

class ServiceAdapter {
    def method
    def bean
    def requestType
    def responseType
    def version

    def equals = { o ->
        return o.method == this.method &&
                o.bean == this.bean &&
                o.requestType == this.requestType &&
                o.responseType == this.responseType
    }

    def process = { request, response ->
        this.method.invoke(this.bean, [request, response])
    }

}

class Message {
    def type
    def version
    def scope
    def data
    def request
    def timestamp

    def makeResponse = {adapter ->
        if (adapter.responesType == null) {
            return null
        } else {
            return Message.new (
                type: adapter.responesType,
                version: this.version,
                scope: this.version,
                request: this.request,
                request: System.currentTimeMillis(),
                data: [])
        }
    }

    static def messagesFromRequest = { request ->
        def messages = []
        def timestamp = Long.parseLong(request.JSON.timestamp)

        request.JSON.messages.each { json_message ->

            def version = json_message["version"]
            if (version == null || version = "")
                version = "1.0"

            messages << Message.new(
                type: json_message['type']
                version: version
                scope: json_message['scope']
                data: json_message['data']
                request: request,
                timestamp: timestamp,
            )
        }

        return messages
    }

    static def messagesFromRequest = { messages, contentType ->
        def out = []
        out["version"] = "1.0"
        out["timestamp"] = System.currentTimeMillis()
        out["messages"] = []

        messages.each { messages ->
            out_mes = []
            out_mes["type"] = response.type
            out_mes["version"] = response.version
            out_mes["scope"] = response.scope
            out_mes["data"] = response.data
            out["messages"] << out_mes
        }
    }

}
