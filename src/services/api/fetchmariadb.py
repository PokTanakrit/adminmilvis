from flask import Flask, jsonify, request
import mariadb
import sys
from flask_cors import CORS
import hashlib
import datetime
import pytz

app = Flask(__name__)

CORS(app)

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
        cursor = connection.cursor(dictionary=True)  # คืนค่าเป็น dict
        print("Connected to MariaDB successfully.")
        return connection, cursor
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB: {e}")
        sys.exit(1)


@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    conn, cursor = connecting_mariadb()
    try:
        cursor.execute("SELECT subject_id, subject_name FROM subject;")
        subjects = cursor.fetchall()
        return jsonify(subjects)
    except mariadb.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/sub_subjects/<int:subject_id>', methods=['GET'])
def get_sub_subjects(subject_id):
    conn, cursor = connecting_mariadb()
    try:
        cursor.execute("SELECT sub_subject_id, sub_subject_name FROM sub_subject WHERE subject_id = %s", (subject_id,))
        sub_subjects = cursor.fetchall()
        return jsonify(sub_subjects)
    except mariadb.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
        
@app.route("/api/admin_login", methods=["POST"])
def admin_login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"success": False, "message": "กรุณากรอกข้อมูลให้ครบ"}), 400

    conn, cursor = connecting_mariadb()
    try:
        cursor.execute("SELECT * FROM admin WHERE admin_username = %s", (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"success": False, "message": "ไม่พบผู้ใช้"}), 401

        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        if hashed_password != user["admin_password"]:
            return jsonify({"success": False, "message": "รหัสผ่านไม่ถูกต้อง"}), 401

        # ✅ บันทึก log: เข้าสู่ระบบสำเร็จ
        log_action("LOGIN", "เข้าสู่ระบบสำเร็จ", username)

        return jsonify({"success": True, "message": "เข้าสู่ระบบสำเร็จ"})
    except mariadb.Error as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()
        
        
def log_action(method, detail, admin_username):
    conn, cursor = connecting_mariadb()
    try:
        # กำหนด timezone เป็น UTC+7
        bangkok_tz = pytz.timezone('Asia/Bangkok')
        log_date = datetime.datetime.now(bangkok_tz).strftime('%Y-%m-%d %H:%M:%S ')

        print(log_date)

        # ค้นหา admin_id จาก username
        cursor.execute("SELECT admin_id FROM admin WHERE admin_username = %s", (admin_username,))
        user = cursor.fetchone()
        admin_id = user["admin_id"] if user else None

        # บันทึก log
        cursor.execute(
            "INSERT INTO log (log_method, log_date, log_detail, admin_id) VALUES (%s, %s, %s, %s)",
            (method, log_date, detail, admin_id)
        )
        conn.commit()
    except mariadb.Error as e:
        print(f"Error logging action: {e}")
    finally:
        cursor.close()  # ปิด cursor ก่อน
        conn.close()

@app.route('/logout', methods=['POST'])
def logout():
    data = request.json
    admin_username = data.get("username")

    if admin_username:
        log_action("LOGOUT", "ออกจากระบบสำเร็จ", admin_username)

    return jsonify({"success": True, "message": "ออกจากระบบแล้ว"})


# ดึงข้อมูล Log
@app.route('/api/logs', methods=['GET'])
def get_logs():
    conn, cursor = connecting_mariadb()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        # ดึงข้อมูลจากฐานข้อมูล
        cursor.execute("SELECT log_id, log_method, log_date, log_detail, admin_id FROM log")
        logs = cursor.fetchall()

        return jsonify(logs)
    
    except mariadb.Error as e:
        return jsonify({"error": f"Database error: {e}"}), 500
    finally:
        conn.close()


if __name__ == "__main__":
    app.run(port=4000)