import { useState } from 'react';
import {User} from '../domain/types'


export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1) validaciones básicas
    if (!name || !email || !password || !repeatPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (password !== repeatPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // 2) leer usuarios existentes de localStorage
    const raw = localStorage.getItem('carniceria_users');
    const users = raw ? JSON.parse(raw) : [];

    // 3) chequear si ya existe el email
    const exists = users.some((u: any) => u.email === email);
    if (exists) {
      setError('Ya existe un usuario con ese email');
      return;
    }

    // 4) crear usuario nuevo
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role: 'operario',
    };

    const updated = [...users, newUser];
    localStorage.setItem('carniceria_users', JSON.stringify(updated));

    setSuccess('Usuario creado correctamente');
    // opcional: limpiar inputs
    setName('');
    setEmail('');
    setPassword('');
    setRepeatPassword('');
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h1>Registro</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label>Repetir contraseña</label>
          <input
            type="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
        </div>

        <button type="submit">Crear cuenta</button>
      </form>
    </div>
  );
}
