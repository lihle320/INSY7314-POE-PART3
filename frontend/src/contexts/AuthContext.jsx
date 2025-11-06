import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isEmployee, setIsEmployee] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        const storedIsEmployee = sessionStorage.getItem('isEmployee');
        
        console.log(' AuthContext Initializing:', {
            storedUser: storedUser ? 'Exists' : 'None',
            storedIsEmployee: storedIsEmployee
        });
        
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                console.log(' AuthContext Loaded User:', userData);
                setUser(userData);
                setIsEmployee(storedIsEmployee === 'true');
            } catch (e) {
                console.error(' AuthContext Error parsing stored user:', e);
                sessionStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, employeeStatus = false) => {
        console.log(' AuthContext Login Called:', { userData, employeeStatus });
        setUser(userData);
        setIsEmployee(employeeStatus);
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('isEmployee', employeeStatus.toString());
        
        console.log(' AuthContext After Login:', {
            user: userData,
            isAuthenticated: !!userData,
            isEmployee: employeeStatus
        });
    };

    const logout = () => {
        console.log(' AuthContext Logout Called');
        setUser(null);
        setIsEmployee(false);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('isEmployee');
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
    };

    const value = {
        user,
        isEmployee,
        login,
        logout,
        loading,
        isAuthenticated: !!user
    };

    console.log(' AuthContext Value:', value);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};