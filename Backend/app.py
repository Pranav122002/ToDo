from flask import Flask, request, jsonify
import psycopg2
from flask_cors import CORS
from urllib.parse import urlparse
import os


app = Flask(__name__)
CORS(app, origins=["https://todo-pranav.onrender.com"])

DATABASE_URL = "postgresql://tododb_63r8_user:WcDoiwOH3Mk9Vy9BSPp5u8ynMuBh41iR@dpg-crq4crij1k6c738b5ep0-a.singapore-postgres.render.com/tododb_63r8"


def get_db_connection():
    result = urlparse(DATABASE_URL)
    conn = psycopg2.connect(
        dbname=result.path[1:],
        user=result.username,
        password=result.password,
        host=result.hostname,
        port=result.port,
    )
    return conn


def create_tasks_table():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,  
            task VARCHAR(255) NOT NULL,
            status BOOLEAN NOT NULL DEFAULT FALSE,
            importance BOOLEAN DEFAULT FALSE
        );
    """
    )
    conn.commit()
    cur.close()
    conn.close()


create_tasks_table()


@app.route("/get-tasks", methods=["GET"])
def get_tasks():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tasks;")
    tasks = cur.fetchall()
    cur.close()
    conn.close()

    print(tasks)

    task_list = [
        {
            "id": row[0] if len(row) > 0 else None,
            "title": row[1] if len(row) > 1 else None,
            "task": row[2] if len(row) > 2 else None,
            "status": row[3] if len(row) > 3 else None,
            "importance": row[4] if len(row) > 4 else None,
        }
        for row in tasks
    ]
    return jsonify(task_list)


@app.route("/add-task", methods=["POST"])
def add_task():
    task_data = request.get_json()
    new_title = task_data["title"]
    new_task = task_data["task"]
    importance = task_data.get("importance", False)

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO tasks (title, task, status, importance) VALUES (%s, %s, %s, %s) RETURNING id;",
        (new_title, new_task, False, importance),
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return jsonify(
        {
            "id": new_id,
            "title": new_title,
            "task": new_task,
            "status": False,
            "importance": importance,
        }
    )


@app.route("/important-tasks", methods=["GET"])
def get_important_tasks():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tasks WHERE important = TRUE;")
    tasks = cur.fetchall()
    cur.close()
    conn.close()

    task_list = [
        {
            "id": row[0],
            "title": row[1],
            "task": row[2],
            "status": row[3],
            "important": row[4],
        }
        for row in tasks
    ]
    return jsonify(task_list)


@app.route("/delete-task/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM tasks WHERE id = %s;", (task_id,))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Task deleted"})


@app.route("/delete-tasks", methods=["DELETE"])
def delete_all_tasks():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM tasks;")
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "All tasks deleted"})


@app.route("/edit-task/<int:task_id>", methods=["PUT"])
def edit_task(task_id):
    task_data = request.get_json()
    updated_title = task_data["title"]
    updated_task = task_data["task"]
    updated_status = task_data["status"]
    updated_importance = task_data["importance"]

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE tasks SET title = %s, task = %s, status = %s, importance = %s WHERE id = %s;",
        (updated_title, updated_task, updated_status, updated_importance, task_id),
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Task updated"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
