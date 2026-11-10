import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/api/tasks', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, description, completed, created_at, updated_at FROM tasks ORDER BY created_at DESC, id DESC'
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/tasks', async (req, res, next) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const description =
      typeof req.body.description === 'string' ? req.body.description.trim() : '';

    if (!title) {
      return res.status(400).json({ message: 'El título es obligatorio' });
    }

    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, completed) VALUES (?, ?, FALSE)',
      [title, description || null]
    );

    const [rows] = await pool.query(
      'SELECT id, title, description, completed, created_at, updated_at FROM tasks WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.put('/api/tasks/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Id inválido' });
    }

    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    const current = existing[0];
    const title =
      typeof req.body.title === 'string' ? req.body.title.trim() : current.title;
    const description =
      typeof req.body.description === 'string'
        ? req.body.description.trim()
        : current.description;
    const completed =
      typeof req.body.completed === 'boolean' ? req.body.completed : Boolean(current.completed);

    if (!title) {
      return res.status(400).json({ message: 'El título es obligatorio' });
    }

    await pool.query(
      'UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?',
      [title, description || null, completed, id]
    );

    const [rows] = await pool.query(
      'SELECT id, title, description, completed, created_at, updated_at FROM tasks WHERE id = ?',
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Id inválido' });
    }

    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
