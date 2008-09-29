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

        // Only GET and POST are allowed
        if (request.getMethod() != "POST" && request.getMethod != "GET") {
            response.setHeader('HTTP/1.0', '405 Bad Request');
            response.setHeader('Allow', 'GET POST');
            render("Invalid method\n")
        }

        // GET requests do nothing currently
        if (request.getMethod == "GET")
            render("")
            return
        }

        Message.messagesFromRequest(request).each { req_message ->

            AppceleratorGrailsPlugin.getAdapters(in_message).each { adapter ->
                def resp_message = in_message.makeResponse(adapter)
                adapter.process(req_message, resp_message)

                if (resp_message != null)
                    outgoingMessages << resp_message
            }
        }

        out = Message.responseFromMessages(outgoingMessages, request.contentType)
        render out as JSON

    }

}
