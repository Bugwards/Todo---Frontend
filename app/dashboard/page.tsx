"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  ClipboardList,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  TrendingUp,
  Award,
  Zap,
  Target
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api, { Todo, TodoStatistics } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "not-started" | "completed">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskPriority, setNewTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [profileImage, setProfileImage] = useState<string | undefined>("https://api.dicebear.com/7.x/avataaars/svg?seed=Felix");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TodoStatistics | null>(null);

  const user = api.getCurrentUser();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setProfileImage(user.profilePicture || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix");
    }
  }, [user, router]);

  // Fetch todos and stats on mount
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedTodos, fetchedStats] = await Promise.all([
          api.getAllTodos(),
          api.getTodoStatistics(),
        ]);
        setTodos(fetchedTodos);
        setStats(fetchedStats);
      } catch (err) {
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Stats (from backend or computed)
  const completedTodos = stats?.completedTasks || todos.filter(t => t.completed).length;
  const pendingTodos = stats?.pendingTasks || todos.filter(t => !t.completed).length;
  const totalTodos = stats?.totalTasks || todos.length;
  const completionRate = stats?.completionRate || (totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      const newTodo = {
        title: newTask,
        priority: newTaskPriority,
        completed: false,
      };
      const createdTodo = await api.createTodo(newTodo);
      setTodos(prev => [...prev, createdTodo]);
      setNewTask("");
      setShowAddModal(false);
      // Update stats
      const updatedStats = await api.getTodoStatistics();
      setStats(updatedStats);
    } catch (err) {
      setError('Failed to create task. Please try again.');
    }
  };

  const handleToggleTodoCompletion = async (id: number, completed: boolean) => {
    try {
      const updatedTodo = await api.toggleTodoCompletion(id);
      setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
      // Update stats
      const updatedStats = await api.getTodoStatistics();
      setStats(updatedStats);
    } catch (err) {
      setError('Failed to update task status. Please try again.');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await api.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      // Update stats
      const updatedStats = await api.getTodoStatistics();
      setStats(updatedStats);
    } catch (err) {
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleLogout = () => {
    api.logout();
    router.push('/login');
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { profilePicture } = await api.uploadProfilePicture(file);
        setProfileImage(profilePicture);
      } catch (err) {
        setError('Failed to upload profile picture. Please try again.');
      }
    }
  };

  const filteredTodos = selectedStatus === "all"
    ? todos
    : selectedStatus === "completed"
    ? todos.filter(t => t.completed)
    : todos.filter(t => !t.completed);

  const pieData = [
    { name: "Completed", value: completedTodos, color: "#10B981" },
    { name: "Pending", value: pendingTodos, color: "#8B5CF6" },
  ];

  // Hardcoded bar chart data (to be replaced with dynamic data)
  const barData = [
    { name: "Mon", completed: 5, pending: 2 },
    { name: "Tue", completed: 7, pending: 3 },
    { name: "Wed", completed: 4, pending: 5 },
    { name: "Thu", completed: 8, pending: 1 },
    { name: "Fri", completed: 6, pending: 4 },
  ];

  if (!user) return null; // Prevent rendering until redirect

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        />
      </div>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 flex flex-col py-6 transition-all relative z-10 shadow-2xl"
      >
        <div className="px-6 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 text-blue-400 hover:text-blue-300 transition"
          >
            <LayoutDashboard size={28} />
            {sidebarOpen && <span className="font-bold text-xl">Dashboard</span>}
          </motion.button>
        </div>
        {/* Profile Section */}
        <div className="px-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`${sidebarOpen ? 'p-4' : 'p-2'} bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-blue-500/20 backdrop-blur-sm`}
          >
            <div className="flex items-center gap-3">
              <div className="relative group">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border-2 border-blue-400 object-cover"
                />
                {sidebarOpen && (
                  <label className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer flex items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                    <User size={16} className="text-white" />
                  </label>
                )}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{user.username}</p>
                  <p className="text-xs text-blue-300">{user.email}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
        <nav className="flex-1 flex flex-col gap-2 px-3">
          <NavItem icon={<ClipboardList size={22} />} label="Tasks" active open={sidebarOpen} />
          <NavItem icon={<User size={22} />} label="Profile" open={sidebarOpen} />
          <NavItem icon={<Settings size={22} />} label="Settings" open={sidebarOpen} />
        </nav>
        <div className="px-3 mt-auto">
          <motion.button
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/20 text-red-400 hover:text-red-300 w-full transition"
          >
            <LogOut size={22} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </motion.button>
        </div>
      </motion.aside>
      {/* Main Content */}
      <div className="flex-1 p-8 relative z-10 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Welcome back, {user.username.split(' ')[0]}! 👋
              </h1>
              <p className="text-slate-400">Here's what's happening with your tasks today.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus size={20} />
              New Task
            </motion.button>
          </div>
        </motion.div>
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex justify-between items-center"
          >
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Retry
            </button>
          </motion.div>
        )}
        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Zap size={48} />
            </motion.div>
            <p>Loading tasks...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<Target className="w-8 h-8" />}
                label="Total Tasks"
                value={totalTodos}
                color="from-blue-600 to-blue-400"
                delay={0}
              />
              <StatCard
                icon={<CheckCircle className="w-8 h-8" />}
                label="Completed"
                value={completedTodos}
                color="from-green-600 to-emerald-400"
                delay={0.1}
              />
              <StatCard
                icon={<Clock className="w-8 h-8" />}
                label="Pending"
                value={pendingTodos}
                color="from-purple-600 to-pink-400"
                delay={0.3}
              />
            </div>
            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-6 rounded-2xl shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Task Distribution</h2>
                  <Award className="text-yellow-400" size={24} />
                </div>
                {totalTodos > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
  data={pieData}
  dataKey="value"
  nameKey="name"
  cx="50%"
  cy="50%"
  outerRadius={100}
  innerRadius={60}
  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
  labelLine={false}
>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    No tasks yet. Create your first task!
                  </div>
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-6 rounded-2xl shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Weekly Progress</h2>
                  <TrendingUp className="text-green-400" size={24} />
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="completed" fill="#10B981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="pending" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
            {/* Task Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3 mb-6 overflow-x-auto pb-2"
            >
              {[
                { label: "All Tasks", value: "all", count: totalTodos },
                { label: "Pending", value: "not-started", count: pendingTodos },
                { label: "Completed", value: "completed", count: completedTodos },
              ].map((filter) => (
                <motion.button
                  key={filter.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedStatus(filter.value as any)}
                  className={`px-6 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    selectedStatus === filter.value
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {filter.label} <span className="ml-2 text-sm">({filter.count})</span>
                </motion.button>
              ))}
            </motion.div>
            {/* Tasks List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-6 rounded-2xl shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Your Tasks</h2>
                <Zap className="text-yellow-400" size={24} />
              </div>
              <AnimatePresence>
                {filteredTodos.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12 text-slate-500"
                  >
                    <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No tasks found. Start by creating a new task!</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {filteredTodos.map((todo, index) => (
                      <TaskCard
                        key={todo.id}
                        todo={todo}
                        index={index}
                        onToggleCompletion={handleToggleTodoCompletion}
                        onDelete={handleDeleteTodo}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Create New Task
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Enter task title..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['LOW', 'MEDIUM', 'HIGH'].map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setNewTaskPriority(priority as any)}
                        className={`py-2 rounded-xl font-medium capitalize transition-all ${
                          newTaskPriority === priority
                            ? priority === 'HIGH'
                              ? 'bg-red-600 text-white'
                              : priority === 'MEDIUM'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-green-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {priority.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium transition-all shadow-lg"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active, open }: { icon: React.ReactNode; label: string; active?: boolean; open: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
        active
          ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30'
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
      }`}
    >
      {icon}
      {open && <span className="font-medium">{label}</span>}
    </motion.button>
  );
}

function StatCard({ icon, label, value, color, delay }: { icon: React.ReactNode; label: string; value: number; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-xl relative overflow-hidden group`}
    >
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            {icon}
          </div>
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap size={20} className="text-white/50" />
          </motion.div>
        </div>
        <h3 className="text-sm font-medium text-white/80 mb-1">{label}</h3>
        <p className="text-4xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );
}

function TaskCard({ todo, index, onToggleCompletion, onDelete }: {
  todo: Todo;
  index: number;
  onToggleCompletion: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}) {
  const statusConfig = {
    completed: { bg: 'from-green-600/20 to-emerald-600/20', border: 'border-green-500/30', text: 'text-green-400', icon: CheckCircle },
    'not-started': { bg: 'from-purple-600/20 to-pink-600/20', border: 'border-purple-500/30', text: 'text-purple-400', icon: Clock },
  };
  const config = todo.completed ? statusConfig.completed : statusConfig['not-started'];
  const StatusIcon = config.icon;
  const priorityColors = {
    HIGH: 'bg-red-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-green-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, x: 5 }}
      className={`bg-gradient-to-r ${config.bg} backdrop-blur-sm border ${config.border} p-5 rounded-xl group relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
      <div className="relative z-10 flex items-center gap-4">
        <div className={`p-2 rounded-lg ${config.bg} border ${config.border}`}>
          <StatusIcon size={24} className={config.text} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className={`font-medium text-white ${todo.completed ? 'line-through opacity-60' : ''}`}>
              {todo.title}
            </p>
            <span className={`w-2 h-2 rounded-full ${priorityColors[todo.priority]}`} />
          </div>
          <p className="text-xs text-slate-400">{todo.dueDate || todo.createdAt.split('T')[0]}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={todo.completed ? 'completed' : 'not-started'}
            onChange={(e) => onToggleCompletion(todo.id, e.target.value === 'completed')}
            className="px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="not-started">Not Started</option>
            <option value="completed">Completed</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(todo.id)}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all"
          >
            <Trash2 size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}