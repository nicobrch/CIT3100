import sqlite3

conn = sqlite3.connect('database.db')
cursor = conn.cursor()

with open('init.sql', 'r') as sql_file:
    sql_script = sql_file.read()

cursor.executescript(sql_script)

conn.commit()
conn.close()
