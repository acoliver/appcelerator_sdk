
-module(appcelerator_message, [Request,Type,Params,Session,Scope]).
-export([get/1,get/2]).

get(request) ->
  Request;
get(type) ->
  Type;
get(params) ->
  Params;
get(session) ->
  Session;
get(scope) ->
  Scope.

get(params, Path) ->
  nested_assoc_lookup(Path, Params);
get(session, Path) ->
  nested_assoc_lookup(Path, Session).


nested_assoc_lookup([], Term) ->
  Term;
nested_assoc_lookup(Path, Term) ->
  [H|T] = Path,
  {struct, Assoc} = Term,
  {value, {_, NextTerm}} = lists:keysearch(H,1,Assoc),
  nested_assoc_lookup(T,NextTerm).

