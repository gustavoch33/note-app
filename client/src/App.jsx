import { useEffect, useState } from 'react'
import { createTask, deleteTask, getTasks, updateTask } from './api'
import './App.css'

const emptyForm = { title: '', description: '' }

function App() {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function loadTasks() {
    try {
      setLoading(true)
      setError('')
      setTasks(await getTasks())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    getTasks()
      .then((data) => {
        if (!ignore) setTasks(data)
      })
      .catch((err) => {
        if (!ignore) setError(err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('El título es obligatorio')
      return
    }

    try {
      setSaving(true)
      setError('')

      if (editingId) {
        await updateTask(editingId, {
          title: form.title.trim(),
          description: form.description.trim(),
        })
      } else {
        await createTask({
          title: form.title.trim(),
          description: form.description.trim(),
        })
      }

      resetForm()
      await loadTasks()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(task) {
    setEditingId(task.id)
    setForm({ title: task.title, description: task.description || '' })
    setError('')
  }

  async function handleToggle(task) {
    try {
      setError('')
      await updateTask(task.id, { completed: !task.completed })
      await loadTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`¿Eliminar la tarea "${task.title}"?`)) {
      return
    }

    try {
      setError('')
      await deleteTask(task.id)
      if (editingId === task.id) {
        resetForm()
      }
      await loadTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Mis tareas</h1>
        <p className="subtitle">Crea, edita y elimina tus tareas</p>
      </header>

      <form className="task-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Título</span>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="¿Qué necesitas hacer?"
            maxLength={255}
          />
        </label>

        <label className="field">
          <span>Descripción</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Detalles opcionales"
            rows={3}
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn primary" disabled={saving}>
            {editingId ? 'Guardar cambios' : 'Añadir tarea'}
          </button>
          {editingId && (
            <button type="button" className="btn ghost" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      <section className="task-list">
        {loading ? (
          <p className="empty">Cargando tareas...</p>
        ) : tasks.length === 0 ? (
          <p className="empty">No hay tareas todavía. ¡Crea la primera!</p>
        ) : (
          tasks.map((task) => (
            <article key={task.id} className={`task ${task.completed ? 'done' : ''}`}>
              <label className="task-check">
                <input
                  type="checkbox"
                  checked={Boolean(task.completed)}
                  onChange={() => handleToggle(task)}
                />
                <div>
                  <h2>{task.title}</h2>
                  {task.description && <p>{task.description}</p>}
                </div>
              </label>

              <div className="task-actions">
                <button className="btn ghost" onClick={() => handleEdit(task)}>
                  Editar
                </button>
                <button className="btn danger" onClick={() => handleDelete(task)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  )
}

export default App
