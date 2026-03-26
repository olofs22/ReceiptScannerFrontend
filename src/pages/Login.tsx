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
        } catch {
            setError('Invalid email or password');
        }
    };
    return( 
    <div>
        <h1>Login</h1>
        {error && <p style={{ color: 'red'}}>{error}</p>}
        <input 
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
        /><input 
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
        />
        <button onClick={handleLogin}>Login</button>
        <p>No Account? <Link to="/register">Register</Link></p>
    </div>
    );
}
export default Login;