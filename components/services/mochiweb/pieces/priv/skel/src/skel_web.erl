%% @author author <author@example.com>
%% @copyright YYYY author.

%% @doc Web server for skel.

-module(skel_web).
-author('author <author@example.com>').

-export([start/1, stop/0, loop/3]).

%% External API

start(Options) ->
    {DocRoot, Options1} = get_option(docroot, Options),
    Services = appcelerator:load_services(),
    Loop = fun (Req) ->
                   ?MODULE:loop(Req, DocRoot, Services)
           end,
    mochiweb_http:start([{name, ?MODULE}, {loop, Loop} | Options1]).

stop() ->
    mochiweb_http:stop(?MODULE).

loop(Req, DocRoot, Services) ->
    case Req:get(path) of
        "/servicebroker" ++ _ ->
            appcelerator:dispatch_request(Services, Req);
        _ ->
            your_loop(Req, DocRoot)
    end.

%% additional non-appcelerator functionality can be added here
your_loop(Req, DocRoot) ->
    "/" ++ Path = Req:get(path),
    case Req:get(method) of
        Method when Method =:= 'GET'; Method =:= 'HEAD' ->
            case Path of
                _ ->
                    Req:serve_file(Path, DocRoot)
            end;
        'POST' ->
            case Path of
                _ ->
                    Req:not_found()
            end;
        _ ->
            Req:respond({501, [], []})
    end.

%% Internal API

get_option(Option, Options) ->
    {proplists:get_value(Option, Options), proplists:delete(Option, Options)}.
