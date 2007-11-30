class Mailer < ActionMailer::Base

  def invite(invite)
    @recipients     = invite.friend_email
    @from           = 'Appcelerator <support@appcelerator.com>'
    @subject        = invite.user.profile.full_name + ' invited you to use Wishlist'
    @sent_on        = Time.now
    @body['invite']  = invite
  end
  
end