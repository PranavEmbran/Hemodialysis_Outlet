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
              to="/"
              className={({ isActive }) =>
                isActive ? "sidebar-heading2 active" : "sidebar-heading2"
              }
              
              title="Dialysis Management"
            >
              Dialysis Management
            </NavLink>
          </li>
          <ul className="sidebar-sublist">


            {/* <li>
              <NavLink
                to="/blank" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Blank" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Blank"}
              </NavLink>
            </li> */}

            <li>
              <NavLink
                // to="/case-opening" style={{ fontWeight: 400, color: "#cccccc" }}
                to="/" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Case Opening" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Case Opening"}
              </NavLink>
            </li>


            <li>
              <NavLink
                to="/scheduling" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Scheduling" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Scheduling"}
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/hdflow-entry" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Dialysis Workflow Entry" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Dialysis Workflow Entry"}
              </NavLink>
            </li>


{/* The following was commentend because they were added to StepperNavigation. */}
            {/* <li>
              <NavLink
                to="/predialysis-record" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Predialysis Record" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Predialysis Record"}
              </NavLink>
            </li> */}

            {/* <li>
              <NavLink
                to="/start-dialysis-record" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Start Dialysis Record" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Start Dialysis Record"}
              </NavLink>
            </li> */}

            {/* <li>
              <NavLink
                to="/haemodialysis-record-details" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "In Process Vitals" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "In Process Vitals"}
              </NavLink>
            </li> */}

            {/* <li>
              <NavLink
                to="/post-dialysis-record" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Post Dialysis Record" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Post Dialysis Record"}
              </NavLink>
            </li> */}
{/* The above was commentend because they were added to StepperNavigation. */}


            <li>
              <NavLink
                to="/hdflow-records" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Dialysis Workflow Records" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Dialysis Workflow Records"}
              </NavLink>
            </li>

            
            
            <li>
              <NavLink
                to="/hd-master" style={{ fontWeight: 400, color: "#cccccc" }}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Hemodialysis Master" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Hemodialysis Master"}
              </NavLink>
            </li>

          </ul>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;
