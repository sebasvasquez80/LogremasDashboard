import { useState } from 'react';
import LateralNav from "./LateralNav.jsx";
import SuperiorNav from "./SuperiorNav.jsx";

function PageLayout({ children }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    return (
        <div className="page-layout">
            
            {/* 🔹 Sidebar (solo visible en escritorio) */}
            <div className="sidebar-area">
                <LateralNav isOpen={true} /> {/* siempre visible en escritorio */}
            </div>

            {/* 🔹 Header */}
            <div className="header-area">
                <SuperiorNav onMenuClick={toggleDrawer} />
            </div>

            {/* 🔹 Contenido */}
            <section className="main-content">
                {children}
            </section>

            {/* 🔹 Menú móvil (drawer) */}
            <LateralNav isOpen={isDrawerOpen} />

            {/* 🔹 Overlay móvil */}
            <div
                className={`drawer-overlay ${isDrawerOpen ? 'active' : ''}`}
                onClick={toggleDrawer}
            />
        </div>
    );
}

export default PageLayout;
