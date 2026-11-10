# Note App

Aplicación sencilla de tareas (crear, editar y eliminar) con:

- **Frontend:** React 19 + Vite (JavaScript)
- **Backend:** Node.js + Express + mysql2
- **Base de datos:** MySQL 8

```
note-app/
├── db/init.sql      # crea la BD, el usuario y la tabla
├── server/          # API REST (puerto 3001)
└── client/          # interfaz React (puerto 5173)
```

## 1. Crear la base de datos y el usuario

Como usuario `root` de MySQL, ejecuta el script:

```powershell
mysql -u root -p < "db\init.sql"
```

Esto crea:

- Base de datos `note_app` (utf8mb4)
- Usuario `note_user`@`localhost` con contraseña `NoteApp123!`
- Permisos **solo** `SELECT, INSERT, UPDATE, DELETE` sobre `note_app.*`
- Tabla `tasks` (`id`, `title`, `description`, `completed`, `created_at`, `updated_at`)

## 2. Configurar el backend

El archivo `server/.env` ya viene con los valores por defecto:

```env
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=note_user
DB_PASSWORD=NoteApp123!
DB_NAME=note_app
```

Instalar dependencias y arrancar:

```powershell
cd server
npm install
npm run dev
```

API disponible en `http://localhost:3001`.

## 3. Arrancar el frontend

```powershell
cd client
npm install
npm run dev
```

Abrir `http://localhost:5173`. Vite redirige `/api` al backend, así que no hay
problemas de CORS en desarrollo.

## API REST

| Método | Ruta             | Descripción                       |
| ------ | ---------------- | --------------------------------- |
| GET    | `/api/health`    | Estado del servicio y la BD       |
| GET    | `/api/tasks`     | Lista todas las tareas            |
| POST   | `/api/tasks`     | Crea una tarea `{title, description}` |
| PUT    | `/api/tasks/:id` | Actualiza `{title, description, completed}` |
| DELETE | `/api/tasks/:id` | Elimina una tarea                 |

Ejemplo con PowerShell:

```powershell
Invoke-RestMethod -Uri http://localhost:3001/api/tasks
```

## Producción (opcional)

```powershell
cd client
npm run build
```

Los archivos estáticos quedan en `client/dist/`.
