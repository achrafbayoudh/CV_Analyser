import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
// import { ThemeProvider } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// import theme from './theme.js';
import CVUpload from './components/CVUpload';
import JobPositions from './components/JobPositions.jsx';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <CVUpload/>
    </BrowserRouter>
  );
}

export default App;