import mysql.connector


conn = mysql.connector.connect(
    host="localhost",        
    user="admin",            
    password="1234", 
    database="attendance_system"
)

cursor = conn.cursor()
cursor.execute("SHOW TABLES;")
print("Tables in attendance_system:", cursor.fetchall())

cursor.close()
conn.close()