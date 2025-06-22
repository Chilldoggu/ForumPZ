import {BrowserRouter as Router, Routes, Route, Link, Navigate} from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import './App.css'
import Register from './components/Register'


function App() {

  return (
    <Router>
        <Routes>
            <Route path="/register" element={<Register/>}/>
        </Routes>
    </Router>
  )
}

export default App
