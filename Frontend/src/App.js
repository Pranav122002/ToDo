import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newTask, setNewTask] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const BASE_URL = "https://todo-lbni.onrender.com";

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async () => {
    if (newTask.trim() === "" || newTitle.trim() === "") return;
    try {
      const response = await axios.post(`${BASE_URL}/add-task`, {
        title: newTitle.trim(),
        task: newTask.trim(),
      });
      setTasks([...tasks, response.data]);
      setNewTask("");
      setNewTitle("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/delete-task/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const deleteAllTasks = async () => {
    try {
      await axios.delete(`${BASE_URL}/delete-tasks`);
      setTasks([]);
    } catch (error) {
      console.error("Error deleting all tasks:", error);
    }
  };

  const startEditingTask = (id, currentText, currentTitle) => {
    setEditingTaskId(id);
    setEditingTaskText(currentText);
    setEditingTaskTitle(currentTitle);
  };

  const saveTask = async (id) => {
    if (editingTaskText.trim() === "" || editingTaskTitle.trim() === "") return;
    const currentTask = tasks.find((task) => task.id === id);
    try {
      await axios.put(`${BASE_URL}/edit-task/${id}`, {
        title: editingTaskTitle.trim(),
        task: editingTaskText.trim(),
        status: currentTask.status,
      });
      setTasks(
        tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                title: editingTaskTitle.trim(),
                task: editingTaskText.trim(),
              }
            : task
        )
      );
      setEditingTaskId(null);
      setEditingTaskText("");
      setEditingTaskTitle("");
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTaskText("");
    setEditingTaskTitle("");
  };

  const toggleTaskStatus = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await axios.put(`${BASE_URL}/edit-task/${id}`, {
        title: tasks.find((task) => task.id === id).title,
        task: tasks.find((task) => task.id === id).task,
        status: newStatus,
      });
      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Error toggling task status:", error);
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="App">
      <h1>To-Do Reminder App</h1>
      <div className="add-task">
        <input
          type="text"
          placeholder="Enter task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              addTask();
            }
          }}
        />
        <input
          type="text"
          placeholder="Enter a new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              addTask();
            }
          }}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search tasks by title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredTasks.length > 0 && (
        <div className="tasks-header">
          <h2>Your Tasks</h2>
        </div>
      )}

      <ul className="tasks-list">
        {filteredTasks.map((task) => (
          <li key={task.id} className="task-item">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={task.status}
                onChange={() => toggleTaskStatus(task.id, task.status)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
            </label>
            {editingTaskId === task.id ? (
              <>
                <input
                  type="text"
                  value={editingTaskTitle}
                  onChange={(e) => setEditingTaskTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      saveTask(task.id);
                    }
                  }}
                />
                <input
                  type="text"
                  value={editingTaskText}
                  onChange={(e) => setEditingTaskText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      saveTask(task.id);
                    }
                  }}
                />
                <button onClick={() => saveTask(task.id)}>Save</button>
                <button onClick={cancelEditing}>Cancel</button>
              </>
            ) : (
              <>
                <span className={`task-text ${task.status ? "completed" : ""}`}>
                  {task.title}: {task.task}
                </span>

                <div className="task-actions">
                  <button
                    onClick={() =>
                      startEditingTask(task.id, task.task, task.title)
                    }
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {filteredTasks.length > 0 && (
        <button onClick={deleteAllTasks} className="delete-all-button">
          Delete All Tasks
        </button>
      )}
    </div>
  );
}

export default App;
