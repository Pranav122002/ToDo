import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen } from "@fortawesome/free-solid-svg-icons";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newTask, setNewTask] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showImportantTasks, setShowImportantTasks] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/get-tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  const addTask = async () => {
    if (newTask.trim() === "" || newTitle.trim() === "") return;
    try {
      const response = await axios.post("http://localhost:5000/add-task", {
        title: newTitle.trim(),
        task: newTask.trim(),
      });
      setTasks([...tasks, response.data]);
      setNewTask("");
      setNewTitle("");
      closeModal();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/delete-task/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const deleteAllTasks = async () => {
    try {
      await axios.delete(`http://localhost:5000/delete-tasks`);
      setTasks([]);
    } catch (error) {
      console.error("Error deleting all tasks:", error);
    }
  };

  const openEditingModal = (id, currentTitle, currentText) => {
    setEditingTaskId(id);
    setEditingTaskTitle(currentTitle);
    setEditingTaskText(currentText);
    setIsEditingModalOpen(true);
  };
  const closeEditingModal = () => {
    setIsEditingModalOpen(false);
    setEditingTaskId(null);
    setEditingTaskTitle("");
    setEditingTaskText("");
  };

  const saveTask = async (id) => {
    if (editingTaskText.trim() === "" || editingTaskTitle.trim() === "") return;
    const currentTask = tasks.find((task) => task.id === id);
    try {
      await axios.put(`http://localhost:5000/edit-task/${id}`, {
        title: editingTaskTitle.trim(),
        task: editingTaskText.trim(),
        status: currentTask.status,
        importance: currentTask.importance,
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
      closeEditingModal();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const toggleTaskStatus = async (id, currentStatus) => {
    try {
      const currentTask = tasks.find((task) => task.id === id);
      const newStatus = !currentStatus;
      await axios.put(`http://localhost:5000/edit-task/${id}`, {
        title: currentTask.title,
        task: currentTask.task,
        status: newStatus,
        importance: currentTask.importance,
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

  const importantTasks = tasks.filter((task) => task.importance === true);

  const toggleStar = async (id) => {
    try {
      const currentTask = tasks.find((task) => task.id === id);
      const newImportance = !currentTask.importance;

      await axios.put(`http://localhost:5000/edit-task/${id}`, {
        title: currentTask.title,
        task: currentTask.task,
        status: currentTask.status,
        importance: newImportance,
      });

      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, importance: newImportance } : task
        )
      );
    } catch (error) {
      console.error("Error toggling task importance:", error);
    }
  };

  return (
    <div className="container">
      <div className="left-panel">
        <h2 className="todo-heading">ToDo</h2>{" "}
        <div className="button-container">
          <button className="todo-button" onClick={openModal}>
            Add Task
          </button>
          <button
            className="todo-button"
            onClick={() => setShowImportantTasks(!showImportantTasks)}
          >
            {showImportantTasks ? "Show All Tasks" : "View Important Tasks"}
          </button>
          <button className="todo-button" onClick={deleteAllTasks}>
            Delete All Tasks
          </button>
        </div>
      </div>

      <div className="right-panel">
        <h2 className="tasks-heading">My Tasks</h2>

        <input
          type="text"
          className="search-bar"
          placeholder="Search tasks by title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="inner-container">
          {(showImportantTasks ? importantTasks : filteredTasks).map((task) => (
            <div className="box" key={task.id}>
              <i
                className={`star fas fa-star ${
                  task.importance ? "filled" : ""
                }`}
                onClick={() => toggleStar(task.id)}
              ></i>

<div className="task-details">
  <p className={`task-title ${task.status ? "cut-off" : ""}`}>{task.title}</p>
  <p className={`task-description ${task.status ? "cut-off" : ""}`}>{task.task}</p>
</div>

              <button
                className="pencil-icon"
                onClick={() => openEditingModal(task.id, task.title, task.task)}
              >
                <FontAwesomeIcon icon={faPen} />
              </button>

              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={task.status}
                  onChange={() => {
                    toggleTaskStatus(task.id, task.status);
                  }}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </label>

              <button
                className="delete-button"
                onClick={() => deleteTask(task.id)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Task</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addTask();
              }}
            >
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

              <button type="submit">Add Task</button>

              <button type="button" onClick={closeModal}>
                Close
              </button>
            </form>
          </div>
        </div>
      )}

      {isEditingModalOpen && (
        <div className="modal-overlay" onClick={closeEditingModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Task</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveTask(editingTaskId);
              }}
            >
              <input
                type="text"
                placeholder="Edit task title"
                value={editingTaskTitle}
                onChange={(e) => setEditingTaskTitle(e.target.value)}
              />

              <input
                type="text"
                placeholder="Edit task description"
                value={editingTaskText}
                onChange={(e) => setEditingTaskText(e.target.value)}
              />

              <button type="submit">Save Changes</button>
              <button type="button" onClick={closeEditingModal}>
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
