import React from "react";
import '../styles/pagecontainer.css';

interface PageContainerProps{
      children?: React.ReactNode;
}
const PageContainer: React.FC<PageContainerProps> = ({children}) => {
    return(
        <>
        <div className="page-container">
            {children}
        </div>
        </>
    );
};
export default PageContainer;