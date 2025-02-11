from app.models import db, User, environment, SCHEMA
from sqlalchemy.sql import text
from werkzeug.security import generate_password_hash

def seed_users():
    demo = User(
        username='Demo', 
        email='demo@aa.io', 
        password='password1', 
        banner_image_url='https://example.com/banner1.jpg',  
        avatar_url='https://example.com/avatar1.jpg'  
    )
    marnie = User(
        username='marnie', 
        email='marnie@aa.io', 
        password='password2', 
        banner_image_url='https://example.com/banner2.jpg',
        avatar_url='https://example.com/avatar2.jpg'
    )
    bobbie = User(
        username='bobbie', 
        email='bobbie@aa.io', 
        password='password3', 
        banner_image_url='https://example.com/banner3.jpg',
        avatar_url='https://example.com/avatar3.jpg'
    )

    db.session.add(demo)
    db.session.add(marnie)
    db.session.add(bobbie)
    db.session.commit()

# Uses a raw SQL query to TRUNCATE or DELETE the users table. SQLAlchemy doesn't
# have a built-in function to do this. With postgres in production TRUNCATE
# removes all the data from the table, and RESET IDENTITY resets the auto
# incrementing primary key, CASCADE deletes any dependent entities. With
# sqlite3 in development you need to instead use DELETE to remove all data and
# it will reset the primary keys for you as well.
def undo_users():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM users"))
        
    db.session.commit()
