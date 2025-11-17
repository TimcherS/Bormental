import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, BarChart3, Edit2 } from 'lucide-react';
import { useCanvas } from '../contexts/CanvasContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/Logo';
import { useState } from 'react';

export default function CanvasSelectPage() {
  const { theme, toggleTheme } = useTheme();
  const { canvases, setActiveCanvasId, addCanvas, deleteCanvas, renameCanvas } = useCanvas();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCanvasName, setNewCanvasName] = useState('');
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameCanvasId, setRenameCanvasId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const cardAppearance = theme === 'dark'
    ? 'bg-gray-900/60 border-gray-700 hover:border-gray-500'
    : 'bg-white border-gray-200 hover:border-gray-300';

  const accentIconClasses = theme === 'dark'
    ? 'bg-blue-500/15 text-blue-300'
    : 'bg-blue-100 text-blue-600';

  const createCardAppearance = theme === 'dark'
    ? 'bg-gray-900/40 border-gray-700/70 hover:border-blue-500 hover:bg-gray-900/60'
    : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50/50';

  const handleCreateCanvas = (e) => {
    e.preventDefault();
    if (newCanvasName.trim()) {
      const id = addCanvas(newCanvasName);
      setActiveCanvasId(id);
      setNewCanvasName('');
      setIsCreateOpen(false);
      navigate('/canvas');
    }
  };

  const handleSelectCanvas = (id) => {
    setActiveCanvasId(id);
    navigate('/canvas');
  };

  const handleDeleteCanvas = (e, id) => {
    e.stopPropagation();
    if (canvases.length === 1) {
      alert('Нельзя удалить последний холст');
      return;
    }
    if (confirm('Вы уверены, что хотите удалить этот холст?')) {
      deleteCanvas(id);
    }
  };

  const handleRenameCanvas = (e, canvas) => {
    e.stopPropagation();
    setRenameCanvasId(canvas.id);
    setRenameValue(canvas.name);
    setIsRenameOpen(true);
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (renameValue.trim()) {
      renameCanvas(renameCanvasId, renameValue.trim());
      setIsRenameOpen(false);
      setRenameCanvasId(null);
      setRenameValue('');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Navigation */}
      <nav className={`border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <Logo showText={true} />
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <Link
                to="/account"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-900 text-white'
                    : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                Аккаунт
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Выберите холст</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Выберите холст для работы или создайте новый
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Existing Canvases */}
          {canvases.map((canvas) => (
            <div
              key={canvas.id}
              className={`rounded-2xl border cursor-pointer transition-shadow hover:shadow-xl group ${cardAppearance}`}
              onClick={() => handleSelectCanvas(canvas.id)}
            >
              <div className="p-6">
                <div className="mb-2 flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${accentIconClasses}`}>
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => handleRenameCanvas(e, canvas)}
                      className="rounded-full p-2 text-blue-500 opacity-0 transition-all hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/10 group-hover:opacity-100"
                      aria-label="Rename canvas"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {canvases.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCanvas(e, canvas.id);
                        }}
                        className="rounded-full p-2 text-red-500 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-red-400 dark:hover:bg-red-500/10 group-hover:opacity-100"
                        aria-label="Delete canvas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-semibold">{canvas.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {canvas.widgets.length} виджет{canvas.widgets.length !== 1 && canvas.widgets.length < 5 ? 'а' : 'ов'}
                </p>
              </div>
            </div>
          ))}

          {/* Create New Canvas */}
          <div
            className={`rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${createCardAppearance}`}
            onClick={() => setIsCreateOpen(true)}
          >
            <div className="flex min-h-[200px] flex-col items-center justify-center p-6 text-center">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${accentIconClasses}`}>
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-medium">Создать новый холст</span>
            </div>
          </div>

          {/* Create Canvas Modal */}
          {isCreateOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsCreateOpen(false);
                }
              }}
              role="dialog"
              aria-modal="true"
            >
              <div
                className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-700 text-white'
                    : 'bg-white border-gray-200'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="mb-4 text-2xl font-bold">Создать новый холст</h3>
                <form onSubmit={handleCreateCanvas}>
                  <div className="mb-6">
                    <label
                      htmlFor="canvasName"
                      className={`mb-2 block text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-black'
                      }`}
                    >
                      Название холста
                    </label>
                    <input
                      id="canvasName"
                      type="text"
                      required
                      value={newCanvasName}
                      onChange={(e) => setNewCanvasName(e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="напр., Маркетинговая панель"
                      autoFocus
                    />
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCreateOpen(false)}
                      className={`rounded-2xl border px-4 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-200 hover:bg-gray-800 focus-visible:ring-gray-600 focus-visible:ring-offset-gray-900'
                          : 'border-gray-300 text-black hover:bg-gray-100 focus-visible:ring-gray-300 focus-visible:ring-offset-white'
                      }`}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="rounded-2xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                    >
                      Создать
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Rename Canvas Modal */}
          {isRenameOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsRenameOpen(false);
                }
              }}
              role="dialog"
              aria-modal="true"
            >
              <div
                className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-700 text-white'
                    : 'bg-white border-gray-200'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="mb-4 text-2xl font-bold">Переименовать холст</h3>
                <form onSubmit={handleRenameSubmit}>
                  <div className="mb-6">
                    <label
                      htmlFor="renameCanvasName"
                      className={`mb-2 block text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-black'
                      }`}
                    >
                      Название холста
                    </label>
                    <input
                      id="renameCanvasName"
                      type="text"
                      required
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="Введите новое название"
                      autoFocus
                    />
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsRenameOpen(false)}
                      className={`rounded-2xl border px-4 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-200 hover:bg-gray-800 focus-visible:ring-gray-600 focus-visible:ring-offset-gray-900'
                          : 'border-gray-300 text-black hover:bg-gray-100 focus-visible:ring-gray-300 focus-visible:ring-offset-white'
                      }`}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="rounded-2xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                    >
                      Переименовать
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
