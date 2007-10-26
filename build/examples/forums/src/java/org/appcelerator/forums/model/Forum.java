package org.appcelerator.forums.model;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.appcelerator.annotation.MessageAttr;
import org.appcelerator.model.AbstractModelObject;

@Entity
@Table(name = "FORUM")
public class Forum extends AbstractModelObject implements Serializable {
private static final long serialVersionUID = 1L;
    
    @MessageAttr
    public String name;
    @MessageAttr
    public Long posts = new Long(0);
    @MessageAttr
    public Long voices = new Long(0);
    @MessageAttr
    public String description;
    @MessageAttr
    public Long threads = new Long(0);
    

    @Column
    public Long getThreads() {
		return threads;
	}
	public void setThreads(Long threads) {
		this.threads = threads;
	}
	@Column
    public String getDescription() {
		return description;
	}

    @MessageAttr (suppress="thread.forum,thread.lastPost,user.lastPost")
    public Post lastPost;
    
	@OneToOne
	public Post getLastPost() 
	{
		return lastPost;
	}
	public void setLastPost(Post lastPost)
	{
		this.lastPost = lastPost;
	}


    public void setDescription(String description) {
		this.description = description;
	}

	@Id
    @GeneratedValue
    public Long getId()
    {
        return super.getId();
    }

    @Column(nullable = false, length = 100, unique = false)
    public String getName() 
    {
		return name;
	}
    @Column(nullable = false)
	public Long getPosts() {
		return posts;
	}

	public void setPosts(Long posts) {
		this.posts = posts;
	}


	@Column
	public Long getVoices() {
		return voices;
	}

	public void setVoices(Long voices) {
		this.voices = voices;
	}
	public void setName(String name) {
		this.name = name;
	}

}
