import org.appcelerator.util.Util

class ServicebrokerController {

    def badRequest = { reason ->
        response.setHeader('Content-Length', '0')
        response.setHeader('Content-type', 'text/plain')
        response.setHeader('X-Failure-Reason', reason)
        response.setHeader('X-Failed-Retry', '1')
        response.setHeader('HTTP/1.0', '400 Bad Request')
        render(request.getHeader("content-type"))
    }

    def index = {
        def sessionid = request.getSession().getId()
        def my_secret_key = "";
        def shared_secret = null

        if (my_secret_key != null) {
            shared_secret = Util.calcMD5(my_secret_key)
        }

        // initialization just starts a session
        if (params["initial"] == "1" || params["init"] == "1") {
            render("")
            return
        }

        def auth = params["auth"]
        def instanceid = params["instanceid"]
        if (auth == null) {
            badRequest("no auth token")
            return
        }

        if (instanceid == null) {
            badRequest("no instanceid")
            return
        }

        if (auth != shared_secret && Util.calcMD5(sessionid + instanceid) != auth) {
            badRequest("invalid auth token")
            return
        }

        render(request.contentType)

    }

    def getIncommingMessages = {
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
                serveletRequest: request,
                timestamp: timestamp,
            )
        }

        return messages
    }

}
