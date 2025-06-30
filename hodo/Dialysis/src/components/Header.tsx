import React, { useState, useEffect } from 'react';
import './header.css';
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react';
import rightarrow from '../assets/righthand.png'
import leftarrow from '../assets/lefthand.png'
import { Calendar, Clock, Calculator } from 'lucide-react';

interface HeaderProps {
    sidebarCollapsed?: boolean;
    toggleSidebar?: () => void;
    showDate?: boolean;
    showTime?: boolean;
    showCalculator?: boolean;
}

const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, toggleSidebar, showDate = true, showTime = true, showCalculator = false }) => {

    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    const currentDateObj = new Date();
    const day = currentDateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const date = currentDateObj.getDate();
    const month = currentDateObj.toLocaleDateString('en-US', { month: 'short' });
    const year = currentDateObj.getFullYear();
    const currentDate = `${day} ${date} ${month} ${year}`;

    const formattedTime = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Cleanup timer on component unmount
        return () => clearInterval(timer);
    }, []);

    return (
        <div className='header-container'>
            {toggleSidebar && (
                <button
                    className="sidebar-toggle-btn"
                    onClick={toggleSidebar}
                    title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {sidebarCollapsed ? (
                        <img src={rightarrow} alt="Expand Sidebar" />
                    ) : (
                        <img src={leftarrow} alt="Collapse Sidebar" />
                    )}
                </button>
            )}

            <h1></h1>
            <div className="header-div">
                {(showDate || showTime || showCalculator) && (
                    <div className="icons-div">
                        {showDate && (
                            <div className="icon-item">
                                <i className="header-icon fa-solid fa-calendar-days"></i>
                                <span className="header-span">{currentDate}</span>
                            </div>
                        )}
                        {showTime && (
                            <div className="icon-item">
                                <i className="header-icon fa-solid fa-clock custom-clock"></i>
                                <span className="header-span">{formattedTime}</span>
                            </div>
                        )}
                        {showCalculator && (
                            <div className="icon-item">
                                <i className="header-icon fa-solid fa-calculator"></i>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
};

export default Header; 