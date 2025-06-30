import React from "react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const shortcuts = {
    "GENERAL SHORTCUTS": [
      { key: "ALT+CTRL+L", description: "Log out or login" },
      { key: "ALT+S", description: "Search Patient (Clear and search if patient selected)" },
      { key: "ALT+R", description: "Register patient" },
      { key: "ALT+H", description: "Visit History (After patient selected)" },
      { key: "ALT+A", description: "Assign Doctor/Lab Tests (After patient selected)" },
      { key: "ALT+F", description: "Add Pending Lab Result" },
      { key: "ALT+J", description: "Add Pending Radiology Result (After patient selected)" },
      { key: "ALT+U", description: "Add Pending Procedure Result (After patient selected)" },
      { key: "ALT+Z", description: "View Lab Entered Results" },
      { key: "ALT+Y", description: "Home collection registration" },
      { key: "F1", description: "Search" },
      { key: "F2", description: "Todays Bills" },
      { key: "F3", description: "Todays Visits" },
      { key: "CTRL + F2", description: "Collect Sample" },
      { key: "F4", description: "Appointments" },
      { key: "F6", description: "Drug Stocks" },
      { key: "ALT + F6", description: "Brand Name wise Stock" },
      { key: "CTRL + F6", description: "Stock transfer" },
      { key: "F7", description: "Pharmacy Sale" },
      { key: "CTRL+F7", description: "Pharmacy Sale Return" },
      { key: "F8", description: "Register Patient" },
      { key: "F9", description: "New Visit" },
      { key: "ALT+M", description: "Search Menu" },
      { key: "ALT+B", description: "Bills" },
      { key: "ALT+K", description: "Bookings" },
      { key: "ALT+N", description: "Next Patient" },
      { key: "ALT+Q", description: "Lab pending" },
      { key: "ALT+W", description: "Radiology pending" },
      { key: "ALT+E", description: "Procedure pending" },
      { key: "ALT+D", description: "Drug pharmacy pending" },
      { key: "CTRL+ALT+P", description: "Printer Settings" },
      { key: "CTRL+ALT+C", description: "Calculator (Contact HODO if not working)" },
    ],
    "ADD CONSULTATION PAGE SHORTCUTS": [
      { key: "ALT+C", description: "Chief Complaint" },
      { key: "ALT+I", description: "Clinical Notes" },
      { key: "ALT+O", description: "On Examination" },
      { key: "ALT+M", description: "Symptoms" },
      { key: "ALT+G", description: "Diagnosis" },
      { key: "ALT+V", description: "Vitals" },
      { key: "ALT+T", description: "Treatment Plan" },
      { key: "ALT+L", description: "Lab Test" },
      { key: "ALT+Y", description: "Radiology" },
      { key: "ALT+P", description: "Procedure" },
      { key: "ALT+X", description: "Common Remarks" },
    ],
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.4)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 8,
        maxWidth: 700,
        width: "90%",
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
        padding: 24,
        position: "relative"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#222" }}>Shortcut Keys</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>&times;</button>
        </div>
        <div style={{ marginBottom: 24 }}>
          {Object.entries(shortcuts).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#222", marginBottom: 8 }}>{category}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {items.map((item, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <kbd style={{ padding: "4px 8px", fontSize: 14, fontWeight: 600, background: "#f3f3f3", border: "1px solid #ddd", borderRadius: 4, color: "#222" }}>{item.key}</kbd>
                    <span style={{ fontSize: 14, color: "#222" }}>{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <button 
            style={{ background: "none", border: "none", color: "#007bff", textDecoration: "underline", cursor: "pointer", fontSize: 15 }}
            onClick={() => window.location.reload()}
          >
            Click here to refresh the page
          </button>
        </div>
      </div>
    </div>
  );
} 
