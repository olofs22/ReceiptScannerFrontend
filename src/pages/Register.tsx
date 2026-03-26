import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import api from '../api/axios';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
            if (password.length < 8){
                setMessage('Password has to be at least 8 characters.')
            }
            if(!/[A-Z]/.test(password)){
                setMessage('Password must contain at least one uppercase letter.')
            }
            if (!/([0-9])/.test(password)){
                setMessage('Password must contain at least one number.')
            }
            try {
                await api.post('/auth/register',{
                emailAdress: email,
                password: password
            });
            setMessage('Registered! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch {
            setMessage('Email already in use')
        }
    };
    return (
        <div>
            <h1>Register</h1>
            {message && <p>{message}</p>}
            <input type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <small>Min 8 characters, one uppercase, one number</small>
            <input type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleRegister}>Register</button>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
}

export default Register;