import {BrowserRouter as Router, Routes, Route, Link, Navigate} from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './App.css'
import Register from './components/Register';
import Login from './components/Login';


function App() {

  return (
    <Router>
        <Routes>
            <Route path="/register" element={<Register/>}/>
            <Route path="/login" element={<Login/>} />
        </Routes>
    </Router>
  )
}

export default App
