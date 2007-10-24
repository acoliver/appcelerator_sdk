package org.appcelerator.forums.model;

import java.io.Serializable;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
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
    
    @Column
    public String getDescription() {
		return description;
	}
    
//    private Set<Forumthread> threads;
////  @OneToMany(mappedBy="forum")
//    @OneToMany
//    @JoinColumn(name="forum_id")
//    public Set<Forumthread> getThreads() {
//    	return threads;
//    }
//    public void setThreads(Set<Forumthread> threads)
//    {
//    	this.threads = threads;
//    }

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
