import hashlib
import mariadb
import sys  # เพิ่ม import sys

# ฟังก์ชันเชื่อมต่อ MariaDB
def connecting_mariadb():
    conn_params = {
        'user': "root",
        'password': "root",
        'host': "localhost",
        'port': 3306,
        'database': "avismariadb"
    }
    try:
        connection = mariadb.connect(**conn_params)
        cursor = connection.cursor()  # ไม่ต้องใช้ dictionary=True ในการ INSERT
        print("Connected to MariaDB successfully.")
        return connection, cursor
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB: {e}")
        sys.exit(1)

# เชื่อมต่อฐานข้อมูล
conn, cursor = connecting_mariadb()

# Hash รหัสผ่านก่อนบันทึก
admin_username = "admin101"
admin_password = "admin101"  # รหัสผ่านเดิม
hashed_password = hashlib.sha256(admin_password.encode()).hexdigest()
admin_email = "admin@email.com"

try:
    cursor.execute("INSERT INTO admin (admin_username, admin_password, admin_email) VALUES (%s, %s, %s)", 
                   (admin_username, hashed_password, admin_email))
    conn.commit()
    print("เพิ่มข้อมูลสำเร็จ!")
except mariadb.Error as e:
    print(f"เกิดข้อผิดพลาด: {e}")
finally:
    conn.close()
