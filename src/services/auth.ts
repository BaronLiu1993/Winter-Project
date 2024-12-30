// interface AuthResponse {
//     token: string;
//     user: {
//         email: string;
//         id: string;
//     };
// }

// export const checkAuth = (): boolean => {
//     const token = localStorage.getItem('token');
//     if (!token) return false;
    
//     // Optional: Check if token is expired
//     try {
//         const payload = JSON.parse(atob(token.split('.')[1]));
//         if (payload.exp < Date.now() / 1000) {
//             localStorage.removeItem('token');
//             localStorage.removeItem('user');
//             return false;
//         }
//         return true;
//     } catch (e) {
//         return false;
//     }
// };

// export const getUser = () => {
//     const userStr = localStorage.getItem('user');
//     return userStr ? JSON.parse(userStr) : null;
// };

// export const login = async (email: string, password: string): Promise<AuthResponse> => {
//     const response = await fetch('http://localhost:8000/api/login/', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//     });

//     if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || 'Login failed');
//     }

//     const data = await response.json();
//     localStorage.setItem('token', data.token);
//     localStorage.setItem('user', JSON.stringify(data.user));
//     return data;
// };

// export const signup = async (email: string, password: string): Promise<AuthResponse> => {
//     const response = await fetch('http://localhost:8000/api/signup/', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//     });

//     if (!response.ok) {
//         throw new Error('Signup failed');
//     }

//     const data = await response.json();
//     localStorage.setItem('token', data.token);
//     return data;
// };

// export const logout = () => {
//     localStorage.removeItem('token');
// }; 