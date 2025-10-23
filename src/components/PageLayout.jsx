// src/components/PageLayout.jsx (Corrección Final)

import { useState } from 'react';
import LateralNav from "./LateralNav.jsx";
import SuperiorNav from "./SuperiorNav.jsx";

function PageLayout({ children }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const toggleDrawer = () => { setIsDrawerOpen(!isDrawerOpen); };

    return (
        <div className="page-layout">
            
            {/* 1. LateralNav FUERA del sidebar-area */}
            

            {/* 2. El sidebar-area VACÍO (solo para reservar espacio en escritorio) */}
            <div className="sidebar-area"><LateralNav isOpen={isDrawerOpen} /></div> 
            
            <div className="header-area">
                <SuperiorNav onMenuClick={toggleDrawer} />
            </div>

            <div 
                className={`drawer-overlay ${isDrawerOpen ? 'active' : ''}`} 
                onClick={toggleDrawer} 
            />

            <section className="main-content">
                {children}
            </section>
        </div>
    );
}

export default PageLayout;