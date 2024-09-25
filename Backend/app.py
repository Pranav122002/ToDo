from flask import Flask, request, jsonify
import psycopg2
from flask_cors import CORS 

app = Flask(__name__)
CORS(app)

# Database connection
def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="postgres",
        user="postgres",
        password="asdf"
    )
    return conn

# Function to create the tasks table if it doesn't exist
def create_tasks_table():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            task VARCHAR(255) NOT NULL,
            status BOOLEAN NOT NULL DEFAULT FALSE
        );
    ''')
    conn.commit()
    cur.close()
    conn.close()

# Create the tasks table when the server starts
create_tasks_table()

# API to get all tasks
@app.route('/tasks', methods=['GET'])
def get_tasks():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM tasks;')
    tasks = cur.fetchall()
    cur.close()
    conn.close()

    task_list = [{'id': row[0], 'task': row[1], 'status': row[2]} for row in tasks]
    return jsonify(task_list)

# API to add a new task
@app.route('/tasks', methods=['POST'])
def add_task():
    task_data = request.get_json()
    new_task = task_data['task']
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('INSERT INTO tasks (task, status) VALUES (%s, %s) RETURNING id;', (new_task, False))
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'id': new_id, 'task': new_task, 'status': False})

# API to delete a task
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM tasks WHERE id = %s;', (task_id,))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'message': 'Task deleted'})

# API to delete all tasks
@app.route('/tasks', methods=['DELETE'])
def delete_all_tasks():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM tasks;')
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'message': 'All tasks deleted'})

# API to edit an existing task
@app.route('/tasks/<int:task_id>', methods=['PUT'])
def edit_task(task_id):
    task_data = request.get_json()
    updated_task = task_data['task']
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('UPDATE tasks SET task = %s WHERE id = %s;', (updated_task, task_id))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'message': 'Task updated'})

if __name__ == '__main__':
    app.run(debug=True)
