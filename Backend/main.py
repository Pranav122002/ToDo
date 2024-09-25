import psycopg2

conn = psycopg2.connect(
    host="localhost",  
    database="postgres",
    user="postgres",
    password="asdf"
)

cur = conn.cursor()

cur.execute('''
    CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        task TEXT NOT NULL,
        status BOOLEAN NOT NULL DEFAULT FALSE
    );
''')

cur.execute('''
    INSERT INTO tasks (task, status)
    VALUES (%s, %s);
''', ("Walking", False))

conn.commit()

cur.execute('SELECT * FROM tasks;')
rows = cur.fetchall()
for row in rows:
    print(row)

cur.close()
conn.close()
