import { useState } from 'react'
import './App.css'
import Register from './components/Register'
import {Routes, Route} from 'react-router-dom'

function App() {

  return (
    <>
        <Routes>
            <Route path="/register" element={<Register/>}/>
        </Routes>
    </>
  )
}

export default App
