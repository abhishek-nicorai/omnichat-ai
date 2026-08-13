from app.db.session import engine
try:
    with engine.connect() as conn:
        print("Successfully connected to Aiven Postgres!")
except Exception as e:
    print(f"Connection failed: {e}")