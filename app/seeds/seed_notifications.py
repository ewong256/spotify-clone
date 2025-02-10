from app.models import db, Notification

def seed_notifications():
    notification1 = Notification(user_id=1, message='You have a new like on your song!', status='unread')
    notification2 = Notification(user_id=2, message='Your album was featured!', status='unread')
    notification3 = Notification(user_id=3, message='Someone added your song to a playlist!', status='unread')

    db.session.add(notification1)
    db.session.add(notification2)
    db.session.add(notification3)
    db.session.commit()

def undo_notifications():
    db.session.execute('DELETE FROM notifications')
    db.session.commit()
