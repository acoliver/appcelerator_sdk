package org.appcelerator.forums.model;

import java.io.Serializable;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.appcelerator.annotation.MessageAttr;
import org.appcelerator.model.AbstractModelObject;

@Entity
@Table(name = "THREAD")
public class Forumthread extends AbstractModelObject implements Serializable {
private static final long serialVersionUID = 1L;
    
    @MessageAttr
    public String name;
    @MessageAttr
    public Long posts= new Long(0);
    @MessageAttr
    public Long voices = new Long(0);
    
    @MessageAttr
    public Forum forum;
    
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
	public void setPosts(long posts) {
		this.posts = posts;
	}

    @Column(nullable = false)
	public Long getVoices() {
		return voices;
	}

	public void setVoices(Long voices) {
		this.voices = voices;
	}

	public void setName(String name) {
		this.name = name;
	}
	@ManyToOne( cascade = {CascadeType.PERSIST, CascadeType.MERGE} )
	@JoinColumn(name="forum_id", insertable=true, updatable=true)
//	@JoinColumn(name="forum_id")
	public Forum getForum() {
		return forum;
	}

	public void setForum(Forum forum) {
		this.forum = forum;
	}


}
