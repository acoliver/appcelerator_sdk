var Mock = Class.create();
Mock.users = new Array();
Mock.forums = new Array();
Mock.threads = new Array();
Mock.posts = new Array();

createUser(1,'billybob','Billy Bob Jackson','Last Login at noon','active');
createUser(2,'leeroy','Leeroy Brown','Last Login April','active');
createUser(3,'maryann','Mary Ann Shaw','Last Login yesteray','active');
createUser(4,'john','John Smith','Last Login January 2005','lurking');

createForum(1,'AppForums','Bug Reports, features, etc.');
createForum(2,'Appcelerator','Open source web2.0 RIA.');
createForum(3,'Apache','THE open source web server.');
createForum(4,'Sexy Sites','Hot rated web2.0 RIA sites.');

/*forumid,userid,id,name*/
createThread(1,1,1,'Starting off the forums');
createThread(2,2,2,'Appcelerator .NET deployment');
createThread(2,3,3,'Appcelerator Iterator question');
createThread(4,2,4,'check this site out');
createThread(3,1,5,'Apache versions....');

/* threadid,userid,id,date,body */
createPost(1,1,1,'Oct 22, 2007 2:13pm','boy this is really good stuff');
createPost(2,1,2,'Oct 22, 2007 2:13pm','i like it too');
createPost(3,2,3,'Sep 20, 2007 1:14pm','What are the differences betweeen 1.3 and 2.0?');
createPost(4,2,4,'Oct 22, 2007 2:13pm','When will the .Net server implementation be ready?');
createPost(5,1,5,'Oct 22, 2007 2:13pm','How soon will it be here?');
createPost(5,3,6,'Oct 22, 2007 2:13pm','Soon....');

function getById(id,collection)
{
	var result = new Array();
	for (var idx=0;idx < collection.length;idx++)
	{
		var obj = collection[idx];
	    if(obj.id == id)
		{
			return obj;
		}
	}
	return '';
}
function getUsersByState(state)
{
	var result = new Array();
	for (var idx=0;idx < Mock.users.length;idx++)
	{
	    if(Mock.users[idx].state == state)
		{
			result.push(Mock.users[idx]);
		}
	}
	return result;
}
function createForum(id,name,desc)
{
	var forum = {'id':id,'name':name,'description':desc,'threads':0,'posts':0};
	Mock.forums.push(forum);
}
/* state is (active|lurking) */
function createUser(id,username,fullName,lastLogin,state)
{
	var user = {'id':id,'username':username,'fullName':fullName,'lastLogin':lastLogin,'state':state,'posts':0};
	Mock.users.push(user);
}
function createThread(forumid,userid,id,name)
{
	var forum = getById(forumid,Mock.forums);
	forum.threads+=1;
	var thread = {'id':id,'name':name,'forum':forum,'posts':0};
	Mock.threads.push(thread);
}
function createPost(threadid,userid,id,date, body)
{
	var thread = getById(threadid,Mock.threads);
	var user = getById(userid,Mock.users);
	var post = {'id':id,'body':body,'user':user,'thread':thread,'date':date};
	var forum = thread.forum;
	user.posts+=1;
	thread.posts+=1;
	thread.lastpost= clonePost(post);
	forum.posts+=1;
	forum.lastpost = clonePost(post);
	Mock.posts.push(post);
	return post;
}
function clonePost(post)
{
	var copy = {'id':post.id,'date':post.date,'body':post.body,'user':post.user};
	return copy;
}
function addUnique(collection,newobj)
{
	var obj = getById(newobj.id,collection);
	if (obj == '')
	{
		collection.push(newobj);
	}
}
function uniqueThreads(posts)
{
	var result = new Array();
	for (var idx=0;idx < posts.length;idx++)
	{
		var post = posts[idx];
		addUnique(result, post.thread);
	}
	return result;
}
function postsByThread(thread)
{
	var result = new Array();
	for (var idx=0;idx < Mock.posts.length;idx++)
	{
		var post = Mock.posts[idx];
		if (post.thread == thread)
		{
			result.push(post);
		}
	}
	return result.sort(sortPost);
}
function postsByQuery(query)
{
	var result = new Array();
	for (var idx=0;idx < Mock.posts.length;idx++)
	{
		var post = Mock.posts[idx];
		var thread = post.thread;
		if (thread.name.match(query) || post.body.match(query) || post.user.username.match(query) || post.user.fullName.match(query))
		{
			result.push(post);
		}
	}
	return result;
}
function postsByUser(userid)
{
	var result = new Array();
	for (var idx=0;idx < Mock.posts.length;idx++)
	{
		var postuserid = Mock.posts[idx].user.id;
	    if(postuserid == userid)
		{
			result.push(Mock.posts[idx]);
		}
	}
	return result;
}
function postsByForum(forumid)
{
	var result = new Array();
	var forum = getById(forumid,Mock.forums);
	for (var idx=0;idx < Mock.threads.length;idx++)
	{
		var thread = Mock.threads[idx];
		if (thread.forum == forum)
		{
			var posts=postsByThread(thread);
			result = result.concat(posts);
		}
	}
	return result;
}
function uniqueUsers(posts)
{
	var result = new Array();
	for (var idx=0;idx < posts.length;idx++)
	{
		var post = posts[idx];
		addUnique(result, post.user);
	}
	return result;
}
function sortPost(a,b)
{
	return a.id - b.id;
}