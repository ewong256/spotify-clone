import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../redux/session';
import './LoginForm.css';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Credential validation
    if (/\s/.test(credential)) {
      return setErrors({ credential: 'Username or email cannot contain spaces' });
    }
    if (credential.length < 4) {
      return setErrors({ credential: 'Username or email must be at least 4 characters' });
    }
    if (credential.length > 255) {
      return setErrors({ credential: 'Username or email must be 255 characters or less' });
    }

    try {
      const response = await dispatch(
        sessionActions.thunkLogin({ credential, password }) // Changed to `credential`
      );

      if (!response) {
        closeModal();
      } else {
        setErrors(response.errors || { message: 'Invalid username/email or password' });
      }
    } catch (err) {
      setErrors({ message: 'Invalid username/email or password' });
      console.error(err);
    }
  };

  const handleDemoLogin = async () => {
    setErrors({});

    try {
      const response = await dispatch(
        sessionActions.thunkLogin({ credential: 'demo1@aa.io', password: 'password1' }) // No need to update state
      );

      if (!response) {
        closeModal();
      } else {
        setErrors({ message: 'Demo login failed' });
      }
    } catch (err) {
      setErrors({ message: 'Demo login failed' });
      console.error(err);
    }
  };

  return (
    <div className="login-modal">
      <h1>Log In</h1>
      {errors.message && <p className="error">{errors.message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Email or Username
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        {errors.credential && <p className="error">{errors.credential}</p>}
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.password && <p className="error">{errors.password}</p>}
        <button type="submit">Log In</button>
        <button type="button" onClick={handleDemoLogin}>Demo Login</button>
      </form>
    </div>
  );
}

export default LoginFormModal;
