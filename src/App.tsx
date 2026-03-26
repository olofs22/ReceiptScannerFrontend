import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login';
import Receipts from './pages/Receipts';
import Register from './pages/Register';

function App(){
  const token = localStorage.getItem('token');
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/receipts" element={token ? <Receipts/>: <Navigate to="/login" />} />
        <Route path="/*" element={<Navigate to="/login" />}/>
      </Routes>
    </BrowserRouter>
    );

}
export default App;