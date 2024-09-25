import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  // Function to fetch tasks from the backend
  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Function to add a new task
  const addTask = async () => {
    if (newTask.trim() === '') return;
    try {
      const response = await axios.post('http://localhost:5000/tasks', { task: newTask.trim() });
      setTasks([...tasks, response.data]);
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Function to delete a task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Function to delete all tasks
  const deleteAllTasks = async () => {
    try {
      await axios.delete(`http://localhost:5000/tasks`);
      setTasks([]); // Clear the tasks from the state
    } catch (error) {
      console.error('Error deleting all tasks:', error);
    }
  };

  // Function to start editing a task
  const startEditingTask = (id, currentText) => {
    setEditingTaskId(id);
    setEditingTaskText(currentText);
  };

  // Function to update the task in the backend
  const saveTask = async (id) => {
    if (editingTaskText.trim() === '') return;
    try {
      await axios.put(`http://localhost:5000/tasks/${id}`, {
        task: editingTaskText.trim(),
        status: false, // Default status, modify as needed
      });
      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, task: editingTaskText.trim() } : task
        )
      );
      setEditingTaskId(null);
      setEditingTaskText('');
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTaskText('');
  };

  return (
    <div className="App">
      <h1>To-Do Reminder App</h1>
      <div className="add-task">
        <input
          type="text"
          placeholder="Enter a new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addTask();
            }
          }}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      {tasks.length > 0 && (
        <div className="tasks-header">
          <h2>Your Tasks</h2>
        </div>
      )}

      <ul className="tasks-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            {editingTaskId === task.id ? (
              <>
                <input
                  type="text"
                  value={editingTaskText}
                  onChange={(e) => setEditingTaskText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      saveTask(task.id);
                    }
                  }}
                />
                <button onClick={() => saveTask(task.id)}>Save</button>
                <button onClick={cancelEditing}>Cancel</button>
              </>
            ) : (
              <>
                <span>{task.task}</span>
                <div className="task-actions">
                  <button onClick={() => startEditingTask(task.id, task.task)}>
                    Edit
                  </button>
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {tasks.length > 0 && (
        <button onClick={deleteAllTasks} className="delete-all-button">
          Delete All Tasks
        </button>
      )}
    </div>
  );
}

export default App;
