'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, CheckCircle, Trash2, Edit2, Clock, Calendar, Tag, Flag, ChevronDown } from 'lucide-react';

// Utility function to format time in 12-hour format with AM/PM
const formatTimeDisplay = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

type Priority = 'low' | 'medium' | 'high';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  dueTime?: string;
  dueDate?: string;
  priority: Priority;
  category?: string;
};

export default function TodoList() {
  // State for new todo form
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDueTime, setEditDueTime] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [isAdding, setIsAdding] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Add a new todo
  const addTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newTodo.trim() === '') return;
    
    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      createdAt: new Date(),
      dueTime: dueTime || undefined,
      dueDate: dueDate || undefined,
      priority,
      category: category || undefined,
    };

    setTodos([...todos, todo]);
    setNewTodo('');
    setDueDate('');
    setDueTime('');
    setPriority('medium');
    setCategory('');
    setIsAdding(false);
  };

  // Toggle todo completion status
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Delete a todo
  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Start editing a todo
  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditDueTime(todo.dueTime || '');
    setEditDueDate(todo.dueDate || '');
    setEditPriority(todo.priority);
  };

  // Save edited todo
  const saveEdit = (id: string) => {
    if (editText.trim() === '') return;
    
    setTodos(
      todos.map(todo =>
        todo.id === id
          ? {
              ...todo,
              text: editText,
              dueTime: editDueTime || undefined,
              dueDate: editDueDate || undefined,
              priority: editPriority,
            }
          : todo
      )
    );
    setEditingId(null);
  };

  // Handle keyboard events for editing
  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  // Sort todos: uncompleted first, then by priority, then by due time
  const sortedTodos = [...todos].sort((a, b) => {
    // First sort by completion status (uncompleted first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then sort by priority (high > medium > low)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (a.priority !== b.priority) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    
    // Finally, sort by due time if available
    if (a.dueTime && b.dueTime) {
      return a.dueTime.localeCompare(b.dueTime);
    }
    
    return 0;
  });

  // Format time for display
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Task Master
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Organize your day, one task at a time
        </p>
      </div>
      
      {/* Add Todo Form */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl mb-8 overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full px-8 py-6 text-left group transition-all duration-300"
          >
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800/50 transition-colors">
                <Plus size={20} className="text-indigo-500 dark:text-indigo-400" />
              </div>
              <span className="text-lg font-medium">Add a new task...</span>
            </div>
          </button>
        ) : (
          <div ref={formRef} className="p-6">
            <form onSubmit={addTodo} className="space-y-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="What's on your mind?"
                  autoFocus
                  className="relative w-full px-6 py-4 text-lg font-medium bg-white dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Due Date</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                    <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900 transition-all duration-200">
                      <div className="pl-4 text-indigo-500">
                        <Calendar size={18} />
                      </div>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent border-0 focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Time</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                    <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900 transition-all duration-200">
                      <div className="pl-4 text-indigo-500">
                        <Clock size={18} />
                      </div>
                      <input
                        type="time"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent border-0 focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Priority</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                    <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900 transition-all duration-200">
                      <div className="pl-4 text-indigo-500">
                        <Flag size={18} />
                      </div>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority)}
                        className="w-full px-4 py-3 bg-transparent border-0 focus:ring-0 text-gray-700 dark:text-gray-200 appearance-none"
                      >
                        <option value="low" className="bg-white dark:bg-gray-800">Low</option>
                        <option value="medium" className="bg-white dark:bg-gray-800">Medium</option>
                        <option value="high" className="bg-white dark:bg-gray-800">High</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Category</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                    <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900 transition-all duration-200">
                      <div className="pl-4 text-indigo-500">
                        <Tag size={18} />
                      </div>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g., Work, Personal"
                        className="w-full px-4 py-3 bg-transparent border-0 focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTodo('');
                    setDueDate('');
                    setDueTime('');
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 flex items-center gap-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">
                    <Plus size={18} />
                  </span>
                  <span>Add Task</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Todo List */}
      <div className="space-y-4">
        {sortedTodos.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">No tasks yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              You're all caught up! Add a new task to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                My Tasks <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">({sortedTodos.length})</span>
              </h2>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  All
                </button>
                <button className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Active
                </button>
                <button className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Completed
                </button>
              </div>
            </div>
            
            {sortedTodos.map((todo) => (
              <div
                key={todo.id}
                className={`group relative overflow-hidden rounded-xl border ${
                  todo.completed
                    ? 'bg-gradient-to-r from-green-50 to-white dark:from-green-900/20 dark:to-gray-800/50 border-green-100 dark:border-green-900/30'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:shadow-md'
                } transition-all duration-200`}
              >
                <div className="p-5">
                  <div className="flex items-start">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`mt-0.5 mr-4 flex-shrink-0 ${
                        todo.completed 
                          ? 'text-green-500' 
                          : 'text-gray-300 hover:text-indigo-500 dark:text-gray-600 dark:hover:text-indigo-500'
                      } transition-colors`}
                      aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      <CheckCircle
                        size={24}
                        className={todo.completed ? 'fill-current' : 'fill-transparent'}
                      />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-medium ${
                          todo.completed 
                            ? 'text-gray-400 dark:text-gray-500 line-through' 
                            : 'text-gray-800 dark:text-white'
                        }`}>
                          {todo.text}
                        </h3>
                        
                        <div className="flex items-center space-x-2">
                          {todo.priority === 'high' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              High
                            </span>
                          )}
                          {todo.priority === 'medium' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                              Medium
                            </span>
                          )}
                          {todo.priority === 'low' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Low
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                        {todo.dueDate && (
                          <span className="inline-flex items-center">
                            <Calendar size={14} className="mr-1.5" />
                            {new Date(todo.dueDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                        {todo.dueTime && (
                          <span className="inline-flex items-center">
                            <Clock size={14} className="mr-1.5" />
                            {todo.dueTime}
                          </span>
                        )}
                        {todo.category && (
                          <span className="inline-flex items-center">
                            <Tag size={14} className="mr-1.5" />
                            {todo.category}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(todo)}
                        className="p-1.5 text-gray-400 hover:text-indigo-500 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                        aria-label="Edit task"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        aria-label="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {todo.completed && (
                  <div className="absolute top-0 right-0 w-1 h-full bg-green-500"></div>
                )}
                
                {editingId === todo.id && (
                  <div className="p-5 border-t border-gray-100 dark:border-gray-700 mt-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, todo.id)}
                        onBlur={() => saveEdit(todo.id)}
                        autoFocus
                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        onClick={() => saveEdit(todo.id)}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Task Master
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Organize your day, one task at a time
        </p>
      </div>
      
      {/* Add Todo Form */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl mb-8 overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full px-8 py-6 text-left group transition-all duration-300"
          >
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800/50 transition-colors">
                <Plus size={20} className="text-indigo-500 dark:text-indigo-400" />
              </div>
              <span className="text-lg font-medium">Add a new task...</span>
            </div>
          </button>
        ) : (
          <div ref={formRef} className="p-6">
            <form onSubmit={addTodo} className="space-y-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="What's on your mind?"
                  autoFocus
                  className="relative w-full px-6 py-4 text-lg font-medium bg-white dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Due Date</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                    <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900 transition-all duration-200">
                      <div className="pl-4 text-indigo-500">
                        <Calendar size={18} />
                      </div>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent border-0 focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Time</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                    <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900 transition-all duration-200">
                      <div className="pl-4 text-indigo-500">
                        <Clock size={18} />
                      </div>
                      <input
                        type="time"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent border-0 focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Priority</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                    <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900 transition-all duration-200">
                      <div className="pl-4 text-indigo-500">
                        <Flag size={18} />
                      </div>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority)}
                        className="w-full px-4 py-3 bg-transparent border-0 focus:ring-0 text-gray-700 dark:text-gray-200 appearance-none"
                      >
                        <option value="low" className="bg-white dark:bg-gray-800">Low</option>
                        <option value="medium" className="bg-white dark:bg-gray-800">Medium</option>
                        <option value="high" className="bg-white dark:bg-gray-800">High</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Category</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                    <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900 transition-all duration-200">
                      <div className="pl-4 text-indigo-500">
                        <Tag size={18} />
                      </div>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g., Work, Personal"
                        className="w-full px-4 py-3 bg-transparent border-0 focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTodo('');
                    setDueDate('');
                    setDueTime('');
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 flex items-center gap-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">
                    <Plus size={18} />
                  </span>
                  <span>Add Task</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Todo List */}
      <div className="space-y-4">
        {sortedTodos.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">No tasks yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              You're all caught up! Add a new task to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                My Tasks <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">({sortedTodos.length})</span>
              </h2>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  All
                </button>
                <button className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Active
                </button>
                <button className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Completed
                </button>
              </div>
            </div>
            
            {sortedTodos.map((todo) => (
              <div
                key={todo.id}
                className={`group relative overflow-hidden rounded-xl border ${
                  todo.completed
                    ? 'bg-gradient-to-r from-green-50 to-white dark:from-green-900/20 dark:to-gray-800/50 border-green-100 dark:border-green-900/30'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:shadow-md'
                } transition-all duration-200`}
              >
                <div className="p-5">
                  <div className="flex items-start">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`mt-0.5 mr-4 flex-shrink-0 ${
                        todo.completed 
                          ? 'text-green-500' 
                          : 'text-gray-300 hover:text-indigo-500 dark:text-gray-600 dark:hover:text-indigo-500'
                      } transition-colors`}
                      aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      <CheckCircle
                        size={24}
                        className={todo.completed ? 'fill-current' : 'fill-transparent'}
                      />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-medium ${
                          todo.completed 
                            ? 'text-gray-400 dark:text-gray-500 line-through' 
                            : 'text-gray-800 dark:text-white'
                        }`}>
                          {todo.text}
                        </h3>
                        
                        <div className="flex items-center space-x-2">
                          {todo.priority === 'high' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              High
                            </span>
                          )}
                          {todo.priority === 'medium' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                              Medium
                            </span>
                          )}
                          {todo.priority === 'low' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Low
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                        {todo.dueDate && (
                          <span className="inline-flex items-center">
                            <Calendar size={14} className="mr-1.5" />
                            {new Date(todo.dueDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                        {todo.dueTime && (
                          <span className="inline-flex items-center">
                            <Clock size={14} className="mr-1.5" />
                            {todo.dueTime}
                          </span>
                        )}
                        {todo.category && (
                          <span className="inline-flex items-center">
                            <Tag size={14} className="mr-1.5" />
                            {todo.category}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(todo)}
                        className="p-1.5 text-gray-400 hover:text-indigo-500 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                        aria-label="Edit task"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        aria-label="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {todo.completed && (
                  <div className="absolute top-0 right-0 w-1 h-full bg-green-500"></div>
                )}
                
                {editingId === todo.id && (
                  <div className="p-5 border-t border-gray-100 dark:border-gray-700 mt-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, todo.id)}
                        onBlur={() => saveEdit(todo.id)}
                        autoFocus
                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        onClick={() => saveEdit(todo.id)}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
