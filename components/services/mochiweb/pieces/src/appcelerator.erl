-module(appcelerator).
-author('Mark Luffel <mluffel@appcelerator.com>').
-export([dispatch_request/2, load_services/0]).

dispatch_request(Services, Req) ->
  ContentType = "application/json",
  case Req:get(method) of
    'POST' ->
      {struct, MsgItems} = mochijson2:decode(Req:recv_body()),
      {value, {_, Messages}} = lists:keysearch(<<"messages">>, 1, MsgItems),
      
      AppMessages = extract_messages(Messages, Req, []),
      Responses = send_messages(Services, AppMessages),
      
      Body = mochijson2:encode({struct, [
        {<<"messages">>, Responses}
      ]}),
      
      Req:respond({200, [{"Content-Type", ContentType}], Body});
      
    _ -> %% whatever, don't dispatch this
      Req:respond({200, [{"Content-Type", ContentType}], ""})
  end.

extract_messages([],_,Acc) -> lists:reverse(Acc);
extract_messages([Msg|Rest],Req,Acc) ->
  AppMsg = extract_message(Msg,Req),
  extract_messages(Rest,Req,[AppMsg|Acc]).

extract_message({struct, Message},Req) ->
  {value, {_,Type}} = lists:keysearch(<<"type">>, 1, Message),
  {value, {_,Params}} = lists:keysearch(<<"data">>, 1, Message),
  {value, {_,Scope}} = lists:keysearch(<<"scope">>, 1, Message),
  appcelerator_message:new(
    Req, to_atom(Type), Params, [], to_atom(Scope)
  ).

%% Send a batch of messages 
%%
send_messages(Services, AppMessages) ->
  lists:flatmap(
    fun(Msg) ->
      case dict:find(Msg:get(type), Services) of
        {ok, Handlers} ->
          lists:map(
            fun({Module,Func,RespType}) ->
              %% TODO, should catch expections here are print + ignore
              ResponsePayload = erlang:apply(Module,Func,[Msg]),
              {struct, [
                {<<"type">>, RespType},
                {<<"data">>, ResponsePayload},
                {<<"scope">>, Msg:get(scope)},
                {<<"datatype">>, 'JSON'},
                {<<"direction">>, 'OUTGOING'}
                %% TODO, sessionid
              ]}
            end,
            Handlers
          );
        error -> []
      end
    end,
    AppMessages).


%% Looks into the ebin directory for files ending in "_service.beam" and loads them.
%% Then scans them for -service({"req","resp",function_name}) declarations,
%% Which we save to a hashtable
%%
load_services() ->
  Services = lists:flatmap(
    fun(Filename) ->
      Flen = string:len(Filename),
      ServiceName = string:substr(Filename,6, Flen-10),
      ModName = list_to_atom(ServiceName),
      code:ensure_loaded(ModName),
      get_services(ModName)
    end,
    filelib:wildcard("ebin/*_service.beam")
  ),
  dict_from_list_with_dups(Services).

%% Helper to load_services/0
%% Examines the attributes of a module for -service({"req","resp",function_name})
%%
get_services(Module) ->
  lists:map(
    fun(Decl) ->
      case Decl of
        {ReqType,RespType,FuncName} ->
          {to_atom(ReqType),{Module,FuncName,to_atom(RespType)}};
        _ ->
          %% TODO: figure out how to display this value sensibly
          io:format("Invalid service declaration, must be 3-tuple~n")
      end
    end,
    get_module_attributes(Module,service)
  ).


%%-----------%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% Utilities
%%-----------%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


%% based on http://fullof.bs/reading-module-attributes-in-erlang
%% which includes a good discussion on erlang's let-it-crash mentality
%%
get_module_attributes(Module,Attribute) ->
  BeamFile = code:which(Module),
  case beam_lib:chunks(BeamFile, [attributes]) of
    { ok, { _, [ {attributes,Attributes} ] } } ->
      case lists:keysearch(Attribute, 1, Attributes) of
          { value, {Attribute,Values} } -> Values;
            false                        -> []
        end;

    { error, beam_lib, { file_error, _, enoent} } ->
      { error, no_such_module }

  end.

%% Takes a list of key/value pairs and converts it into a hashtable
%% All the values for a given key will be collected into a list
%% If a given key appears only once, it will map to a list with one element
%%
dict_from_list_with_dups(List) ->
  dict_from_list_with_dups(List, dict:new()).

dict_from_list_with_dups([], D) -> D;
dict_from_list_with_dups([{K,V}|T],D) ->
  NewD = dict:append(K,V,D),
  dict_from_list_with_dups(T,NewD).

%% Convert various string-like-things into atoms,
%% so that hashtable lookups don't fail,
%% and to_json'd objects don't contain lists of numbers!!!
%%
to_atom(X) when is_binary(X) -> list_to_atom(binary_to_list(X));
to_atom(X) when is_list(X) -> list_to_atom(X);
to_atom(X) when is_atom(X) -> X.
