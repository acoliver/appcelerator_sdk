package org.appcelerator.forums.model;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.appcelerator.annotation.MessageAttr;
import org.appcelerator.model.AbstractModelObject;

@Entity
@Table(name = "USER")
public class Post extends AbstractModelObject implements Serializable {
private static final long serialVersionUID = 1L;
    
    @MessageAttr
    private Forumthread thread;
    @MessageAttr
    private User user;
    @MessageAttr
    private String body;
    @MessageAttr
    private Date date;
    
    @ManyToOne
    public Forumthread getThread() {
		return thread;
	}

	public void setThread(Forumthread thread) {
		this.thread = thread;
	}

	@ManyToOne
	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
	@Column(nullable = false)
	public String getBody() {
		return body;
	}

	public void setBody(String body) {
		this.body = body;
	}
	@Column
	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	@Id
    @GeneratedValue
    public Long getId()
    {
        return super.getId();
    }
}
