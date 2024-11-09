import React, { createContext, useContext, useState, useEffect } from 'react';

const GoalContext = createContext();

export const useGoalContext = () => {
    return useContext(GoalContext);
};

export const GoalProvider = ({ children }) => {
    const [goals, setGoals] = useState([
        {
            title: "Make a new friend",
            complete: false,
        },
        {
            title: "Explore the stars",
            complete: false,
        }
    ])
    
    return (
        <GoalContext.Provider 
            value={{
               goals, setGoals
            }}>
            {children}
        </GoalContext.Provider>
    );
};