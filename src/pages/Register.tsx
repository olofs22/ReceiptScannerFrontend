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
    <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '32px 24px'
    }}>
        <div style={{ marginBottom: '40px' }}>
            <h1 style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '48px',
                fontWeight: '800',
                lineHeight: 1
            }}>kvitt</h1>
            <p style={{ color: 'var(--grey-mid)', marginTop: '8px', fontSize: '15px' }}>
                create account
            </p>
        </div>

        {message && (
            <div style={{
                background: message.includes('Registered') ? 'var(--green-light)' : '#fff0f0',
                border: `1px solid ${message.includes('Registered') ? 'var(--green)' : '#ffcccc'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                marginBottom: '16px',
                color: message.includes('Registered') ? 'var(--green-dark)' : '#cc0000',
                fontSize: '14px'
            }}>{message}</div>
        )}

        <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} />
        <small style={{ color: 'var(--grey-mid)', fontSize: '12px', marginTop: '-8px', marginBottom: '16px', display: 'block' }}>
            Min 8 characters, one uppercase, one number
        </small>

        <button onClick={handleRegister} style={{
            width: '100%',
            background: 'var(--green)',
            color: 'var(--white)',
            padding: '16px',
            borderRadius: 'var(--radius)',
            fontSize: '16px',
            marginTop: '8px'
        }}>Register</button>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--grey-mid)', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--green)', fontWeight: '600', textDecoration: 'none' }}>
                Login
            </Link>
        </p>
    </div>
);
}

export default Register;