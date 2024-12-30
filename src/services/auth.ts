interface AuthResponse {
    token: string;
    user: {
        email: string;
        id: string;
    };
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
};

export const signup = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch('http://localhost:8000/api/signup/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Signup failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
};

export const logout = () => {
    localStorage.removeItem('token');
}; 