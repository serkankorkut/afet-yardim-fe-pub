import React from 'react';
import './App.css';
import HeaderComponent from './components/HeaderComponent';
import FooterComponent from './components/FooterComponent';
import MainPage from "./components/MainPage";

function App() {
    return (
        <div>
            <HeaderComponent/>
            <MainPage/>
            <FooterComponent/>
        </div>

    );
}

export default App;
