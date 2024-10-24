import React, { createContext, useContext } from 'react';

const DataContext = createContext();

export const useDataContext = () => {
    return useContext(DataContext);
};

export const DataProvider = ({ children, value }) => {
    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};