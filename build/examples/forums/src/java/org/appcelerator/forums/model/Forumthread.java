package org.appcelerator.forums.model;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.appcelerator.annotation.MessageAttr;
import org.appcelerator.model.AbstractModelObject;

@Entity
@Table(name = "THREAD")
public class Forumthread extends AbstractModelObject implements Serializable {
private static final long serialVersionUID = 1L;
    
    @MessageAttr
    private String name;
    @MessageAttr
    private Long posts;
    @MessageAttr
    private Long voices;
    
    @MessageAttr
    private Forum forum;
    
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

    @Column(nullable = false)
	public Long getVoices() {
		return voices;
	}

	public void setVoices(Long voices) {
		this.voices = voices;
	}

	public void setName(String fullName) {
		this.name = fullName;
	}

	@ManyToOne
	public Forum getForum() {
		return forum;
	}

	public void setForum(Forum forum) {
		this.forum = forum;
	}


}
