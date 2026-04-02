import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import api from '../api/axios';

function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await api.post('/auth/login', {
                emailAdress: email,
                password: password
            });
            localStorage.setItem('token', res.data.token);
            navigate('/receipts');
        } catch (err){
            console.error(err);
            setError('Invalid email or password');
        }
    };
    return (
    <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '32px 24px',
        background: 'var(--white)'
    }}>
        <div style={{ marginBottom: '40px' }}>
            <h1 style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '48px',
                fontWeight: '800',
                color: 'var(--black)',
                lineHeight: 1
            }}>kvitt</h1>
            <p style={{ color: 'var(--grey-mid)', marginTop: '8px', fontSize: '15px' }}>
                split smarter
            </p>
        </div>

        {error && (
            <div style={{
                background: '#fff0f0',
                border: '1px solid #ffcccc',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                marginBottom: '16px',
                color: '#cc0000',
                fontSize: '14px'
            }}>{error}</div>
        )}

        <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} />

        <button onClick={handleLogin} style={{
            width: '100%',
            background: 'var(--green)',
            color: 'var(--white)',
            padding: '16px',
            borderRadius: 'var(--radius)',
            fontSize: '16px',
            marginTop: '8px'
        }}>Login</button>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--grey-mid)', fontSize: '14px' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--green)', fontWeight: '600', textDecoration: 'none' }}>
                Register
            </Link>
        </p>
    </div>
);
}
export default Login;