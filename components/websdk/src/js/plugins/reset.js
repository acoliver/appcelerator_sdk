$.each(['clear','reset','clearform'],function()
{
	$.fn[this] = function()
	{
		$.each(this,function()
		{
			var target = $(this);
			var tag = App.getTagname(this);

			switch (tag)
			{
				case 'a':
				{
				    target.attr('href','#');
					break;
				}
				case 'form':
				{
					this.reset();
					target.find(":input").revalidate();
		            break;
				}
				default:
				{
					target.val('');
					break;
				}
			}		
		});
		return this;
	}
});


