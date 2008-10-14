
var hit = false;

test.begin();
function listener(data,scope,version,name,direction)
{
	hit = true;
	test.assert("name was invalid. excepted: foo, was: "+name,name=='foo');
	test.assert("direction in the listener was invalid. expected: local, was: "+direction,direction=='local');
	test.end();
}

$(document).sub('l:foo',listener);
$(document).pub('l:foo');
$(document).unsub('l:foo',listener);

// make sure that we hit our listener
test.assert(hit);

// reset it and then then pub again and make 
// sure we didn't hit our listener
hit = false;
$(document).pub('l:foo');
test.assert("didn't call our listener",hit===false);

// test normalization of the message format
test.assert("App.normalizePub('l:foo')=='local:foo'")
test.assert("App.normalizePub('local:foo')=='local:foo'")
test.assert("App.normalizePub('r:foo')=='remote:foo'")
test.assert("App.normalizePub('remote:foo')=='remote:foo'")
test.assert("App.normalizePub('*:foo')=='both:foo'")
test.assert("App.normalizePub('both:foo')=='both:foo'")
test.assert("App.normalizePub('foo')=='both:foo'")

// assert that the last message queued was l:foo
test.assertPub("l:foo");
// assert to make sure the normalization is working
test.assertPub("local:foo");
// make sure that local listeners get remote messages as well

function listener2(data,scope,version,name,direction)
{
	test.assert("name was invalid. excepted: foo, was: "+name,name=='foo');
	test.assert("direction in the listener was invalid. expected: remote, was: "+direction,direction=='remote');
	// assert that the last message was our remote one
	test.assertPub("r:foo");
	// assert that the last message was our remote one (normalized)
	test.assertPub("remote:foo");
	test.end();
}

test.begin();
$(document).sub('r:foo',listener2);
$(document).pub('r:foo');
$(document).unsub('r:foo',listener2);

