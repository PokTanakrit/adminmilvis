import datetime
import pytz
import mysql.connector

# Example UTC time from database (use the current UTC time for testing)
log_date_utc = datetime.datetime.utcnow().replace(tzinfo=pytz.utc)

# Convert to Bangkok timezone
bangkok_tz = pytz.timezone('Asia/Bangkok')
log_date_bangkok = log_date_utc.astimezone(bangkok_tz)

# Format for MySQL (WITHOUT "GMT+7")
log_date_for_db = log_date_bangkok.strftime('%Y-%m-%d %H:%M:%S')

# Insert into MySQL
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="avismariadb"
)
cursor = conn.cursor()

# Get current time in Bangkok timezone
bangkok_tz = pytz.timezone('Asia/Bangkok')
log_date = datetime.datetime.now(bangkok_tz).strftime('%Y-%m-%d %H:%M:%S')

    # Insert query
sql = "INSERT INTO log (admin_id, log_date, log_detail, log_method) VALUES (%s, %s, %s, %s)"
values = (2, log_date, "ทดสอบบันทึกเวลา", "LOGIN")

cursor.execute(sql, values)
conn.commit()
print("✅ Log inserted successfully!")

