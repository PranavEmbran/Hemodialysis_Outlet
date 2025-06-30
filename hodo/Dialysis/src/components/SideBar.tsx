import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";
// import { GraphIcon } from '@primer/octicons-react'
// import { PlusCircleIcon } from '@primer/octicons-react'
// import { ListUnorderedIcon } from '@primer/octicons-react'
// import { ReportIcon } from '@primer/octicons-react'
// import { ShieldCheckIcon } from '@primer/octicons-react'
// import { FileDirectoryIcon } from '@primer/octicons-react'
// import { LocationIcon } from '@primer/octicons-react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
// import logo from '../assets/logo.png';
import sidebarLogo from "../assets/sidebarlogo.png";
import '../styles/sidebar.css'

interface SideBarProps {
  collapsed?: boolean;
}

const SideBar: React.FC<SideBarProps> = ({ collapsed = false }) => {
  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-content">
        <div className="sidebar-top">
          <a
            href=""
            className={`sidebar-profile ${collapsed ? "collapsed" : ""}`}
          >
            <img src={sidebarLogo} alt="" />
          </a>
          <div className="sidebar-text">
            <h6 className="sidebar-heading">System Admin</h6>
            <h4 className="sidebar-para">HODO Hospital,</h4>
            <p className="sidebar-para">Kazhakkottam</p>
            <p className="sidebar-para2">System Admin</p>
          </div>
        </div>
        <div className={`searchbar ${collapsed ? "collapsed" : ""}`}>
          <div className="sidebar-date">
            <h6 className="sidebar-date-heading">
              @Anchal {new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }).format(new Date())}
            </h6>

          </div>
          <input
            type="text"
            className="searchbar"
            placeholder="Search Menu- Ctrl + M"
          />
        </div>
      </div>
      <nav>
        <ul>
          <li className="sidebar-title">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "sidebar-heading2 active" : "sidebar-heading2"
              }
              title="Dialysis Management"
            >
              Dialysis Management
            </NavLink>
          </li>
          <ul className="sidebar-sublist">
            <li>
              <NavLink
                to="/"
                style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Dashboard" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Dashboard"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/registration" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Patient Registration" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Patient Registration"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/schedule" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Schedule" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Schedule"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/process" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Start Dialysis" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Start Dialysis"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dialysis-flow-chart" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Dialysis Flow Chart" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Dialysis Flow Chart"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/haemodialysis-record-details" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "HD Record" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "HD Record"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/billing" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Billing" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Billing"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/history" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "History" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "History"}
              </NavLink>
            </li>
          </ul>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;
