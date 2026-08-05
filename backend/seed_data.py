from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models, utils

# Create tables if not exist
models.Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # 1. Ensure a demo user exists for these profiles
    demo_phone = "03001234567"
    user = db.query(models.User).filter(models.User.phone_number == demo_phone).first()
    if not user:
        user = models.User(
            phone_number=demo_phone,
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created demo user: {demo_phone}")

    # 1.5 Add Admin User
    admin_phone = "09999999999"
    admin_user = db.query(models.User).filter(models.User.phone_number == admin_phone).first()
    if not admin_user:
        admin_user = models.User(
            phone_number=admin_phone,
            is_active=True,
            is_verified=True,
            role=models.UserRole.ADMIN.value
        )
        db.add(admin_user)
        db.commit()
        print(f"Created admin user: {admin_phone}")

    # 2. Add Dummy Profiles
    profiles = [
        {
            "name": "Sara Khan",
            "gender": "Female",
            "dob": "1998-05-15",
            "marital_status": "Unmarried",
            "location_city": "Lahore",
            "sect": "Sunni",
            "caste": "Rajput",
            "education_level": "Masters",
            "profession": "Doctor",
            "height": "5ft 4in",
            "image_url": "" 
        },
        {
            "name": "Ayesha Ahmed",
            "gender": "Female",
            "dob": "2000-01-20",
            "marital_status": "Unmarried",
            "location_city": "Karachi",
            "sect": "Sunni",
            "caste": "Sheikh",
            "education_level": "Bachelors degree",
            "profession": "Software Provided",
            "height": "5ft 6in",
            "image_url": ""
        },
        {
            "name": "Fatima Bibi",
            "gender": "Female",
            "dob": "1995-11-12",
            "marital_status": "Divorced",
            "location_city": "Islamabad",
            "sect": "Shia",
            "caste": "Syed",
            "education_level": "PhD",
            "profession": "Professor",
            "height": "5ft 5in",
            "image_url": ""
        },
        {
            "name": "Ali Raza",
            "gender": "Male",
            "dob": "1996-03-10",
            "marital_status": "Unmarried",
            "location_city": "Lahore",
            "sect": "Sunni",
            "caste": "Arain",
            "education_level": "Masters",
            "profession": "Engineer",
            "height": "5ft 10in",
            "image_url": ""
        },
        {
            "name": "Zain Malik",
            "gender": "Male",
            "dob": "1993-07-25",
            "marital_status": "Unmarried",
            "location_city": "Karachi",
            "sect": "Sunni",
            "caste": "Jatt",
            "education_level": "Bachelors degree",
            "profession": "Business",
            "height": "6ft",
            "image_url": ""
        }
    ]

    for p_data in profiles:
        # Check if exists
        exists = db.query(models.Profile).filter(models.Profile.name == p_data["name"]).first()
        if not exists:
            profile = models.Profile(
                user_id=user.id,
                **p_data,
                profile_creator="Self",
                religion="Islam",
                country="Pakistan",
                is_profile_public=True
            )
            db.add(profile)
            print(f"Added profile: {p_data['name']}")
    
    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_data()
