package org.appcelerator.forums.model;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.appcelerator.annotation.MessageAttr;
import org.appcelerator.model.AbstractModelObject;

@Entity
@Table(name = "FORUM")
public class Forum extends AbstractModelObject implements Serializable {
private static final long serialVersionUID = 1L;
    
    @MessageAttr
    private String name;
    @MessageAttr
    private Long posts;
    @MessageAttr
    private Long threads;
    @MessageAttr
    private Long voices;
    @MessageAttr
    private String description;
    
    @Column
    public String getDescription() {
		return description;
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

    @Column(nullable = false)
	public long getThreads() {
		return threads;
	}

	public void setThreads(long threads) {
		this.threads = threads;
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

	public void setThreads(Long threads) {
		this.threads = threads;
	}
}
