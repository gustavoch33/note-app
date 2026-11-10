const BASE_URL = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'Error en la petición')
  }

  return data
}

export const getTasks = () => request('/tasks')

export const createTask = (task) =>
  request('/tasks', { method: 'POST', body: JSON.stringify(task) })

export const updateTask = (id, task) =>
  request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) })

export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' })
