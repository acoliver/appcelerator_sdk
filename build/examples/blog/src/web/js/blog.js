function saveLayoutData(data) 
{
	var header_snippets = getSnippets('header_drop_area');
	var content_snippets = getSnippets('content_drop_area');
	var sidebar_snippets = getSnippets('sidebar_drop_area');
	var footer_snippets = getSnippets('footer_drop_area');	
	var args = {'header_snippets': header_snippets,
			'content_snippets': content_snippets,
			'sidebar_snippets': sidebar_snippets,
			'footer_snippets': footer_snippets,
			'layout_id': data.layout_id,
			'close': data.close
	};
	$MQ('r:save.layout.request', args);
};

function getSnippets(element)
{
	var snippet_ids = [];
	var element_children = $(element).descendants();
	element_children.each(function(child)
	{
		var snippet_id = child.getAttribute('snippet_id');
		if(snippet_id)
		{
			snippet_ids.push(snippet_id);
		}
	});

	return snippet_ids;
};