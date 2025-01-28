import React from 'react';
import ThreeScene from './components/ThreeScene';
import logo from './logo.svg';
import './App.css';

function App() {
    return (
        <div className="App">
            <ThreeScene />
            <div id="hoverText" style={{ position: 'absolute', top: 0, left: 0, color: 'white', display: 'none' }}></div>
        </div>
    );
}

export default App;
