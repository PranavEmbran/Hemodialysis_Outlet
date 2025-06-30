import React from 'react';
import '../styles/cards.css'

export interface CardProps {
  title: string;
  subtitle:string;
}
const Cards: React.FC<CardProps> = ({title,subtitle}) => {

  return (
    <>
        {/* <div className="dashboard-summary-cards"> */}
          <div className="summary-card">
            <div className="summary-title">{title}</div>
            <div className="summary-value">{subtitle}</div>
          </div>
        {/* </div> */}
    </>
  );
};

export default Cards; 

