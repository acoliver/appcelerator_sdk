class Mailer < ActionMailer::Base

  def invite(invite)
    @recipients     = invite.friend_email
    @from           = 'WishaLista <support@appcelerator.com>'
    @subject        = invite.user.profile.full_name + ' invited you to use Wishlist'
    @sent_on        = Time.now
    @body['invite']  = invite
  end
  
  def list(user,email_to)
    @recipients     = email_to
    @from           = 'WishaLista <support@appcelerator.com>'
    @subject        = "#{user.profile.firstname} #{user.profile.lastname} invited you to view their Wishlist"
    @sent_on        = Time.now
    body[:url]      = SITE_URL + "/main.html?id=#{user.id}"
    body[:name]     = user.profile.firstname + ' ' +user.profile.lastname
  end
  
  def activation(user)
    @recipients     = user.email
    @from           = 'WishaLista <support@appcelerator.com>'
    @subject        = "Activation for WishaLista -- ATTENTION REQUIRED"
    @sent_on        = Time.now
    body[:url]      = SITE_URL + "/activate.html?code=#{user.activation}"
  end
end