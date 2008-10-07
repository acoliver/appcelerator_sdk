%% @author author <author@example.com>
%% @copyright YYYY author.

%% @doc Appcelerator services for skel.

-module(skel_service).
-author('author <author@example.com>').

-service({"app.test.message.request","app.test.message.response", test_message}).

-compile(export_all).

test_message(Msg) ->
  Message = binary_to_list(Msg:get(params,[<<"message">>])),
  {struct, [
    {<<"message">>, list_to_binary("You said " ++ Message ++ "!")}
  ]}.
