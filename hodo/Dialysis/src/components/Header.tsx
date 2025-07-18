import React, { useState, useEffect } from 'react';
import '../styles/header.css';
// import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react';
import leftarrow from '../assets/lefthand.png'
import rightarrow from '../assets/righthand.png'
// import { Calendar, Clock, Calculator } from 'lucide-react';
import { FaCalculator, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator } from '@fortawesome/free-solid-svg-icons';


interface HeaderProps {
    sidebarCollapsed?: boolean;
    toggleSidebar?: () => void;
    showDate?: boolean;
    showTime?: boolean;
    showCalculator?: boolean;
}

const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, toggleSidebar, showDate = true, showTime = true, showCalculator = true }) => {

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
                                {/* <i className="header-icon fa-solid fa-calendar-days"></i> */}
                                <FaCalendarAlt className="header-icon" />
                                <span className="header-span">{currentDate}</span>
                            </div>
                        )}
                        {showTime && (
                            <div className="icon-item">
                                {/* <i className="header-icon fa-solid fa-clock custom-clock"></i> */}
                                <FaClock className="header-icon" />
                                <span className="header-span">{formattedTime}</span>
                            </div>
                        )}
                        {showCalculator && (
                            <div className="icon-item">
                                {/* <i className="header-icon fa-solid fa-calculator"></i> */}
                                {/* <FaCalculator className="header-icon" /> */}
                                <FontAwesomeIcon className="header-icon" icon={faCalculator} style={{color: "#000000", fontSize: "16px", padding: "2px", borderRadius: "7px" }} />
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
};

export default Header; 