import apiClient from '../utils/apiClient';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const endpoints = {
    loginApi: '/auth/login',
    register: '/auth/register',
    logoutApi: 'auth/logout',
    googleAuthUrl: '/google/auth-url',
    googleLogin: '/google/callback',
};

export const loginUser = createAsyncThunk('auth/cover-login', async ({ formData }: { formData: FormData; }, { rejectWithValue }) => {
    try {
        const response = await apiClient.post(endpoints.loginApi, formData);
        return {data: response.data.data, status: response.status, message:response.data.message, permissions : response.data.data.permission, role : response.data.data.role};
    } catch (error: any) {
        return rejectWithValue({data: error.response.data, status: error.status, message:error.response.data.message});
    }
  });

export const signupUser = createAsyncThunk('auth/signupUser', async (userData) => {
    const response = await apiClient.post(endpoints.register, userData);
    return response.data;
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async ({ login_user_id }: { login_user_id: number }, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.logoutApi, {
                login_user_id: login_user_id,
            });
            return response;
        } catch (err) {
            console.error('Logout failed', err);
            return rejectWithValue(err);
        } finally {
            dispatch(logout()); // clear localStorage & state
        }
    }
);


export const handleGoogleCallback = createAsyncThunk('auth/handleGoogleCallback', async ({ token, user }: { token: string; user: any }, { rejectWithValue }) => {
        try {
            const userData = typeof user === 'string' ? JSON.parse(atob(user)) : user;
            return {
                token,
                user: userData,
                permissions: userData.permissions || [],
                role: userData.roles || 'agent'
            };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);



export const fetchGoogleAuthUrl = createAsyncThunk('auth/fetchGoogleAuthUrl', async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.googleAuthUrl);
            return response.data.url;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);





const savedUser = localStorage.getItem('authUser');
let parsedUser = null;
if (savedUser) {
    try {
        parsedUser = JSON.parse(savedUser);
    } catch (e) {
        localStorage.removeItem('authUser');
    }
}

const initialState = {
    isAuthenticated: !!localStorage.getItem('authToken'),
    user: parsedUser, 
    error: null,
    success: false,
    message: '',
    status: 0,
    token: localStorage.getItem('authToken') || null,
    googleAuthUrl: null,
    loading: false
};


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            localStorage.removeItem('permissions');
            localStorage.removeItem('role');

        },

        updateUser: (state, action) => {
            state.user = action.payload;
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload.data.user;
                state.token = action.payload.data.token;
                state.error = null;
                state.status =  action.payload.status
                state.message = action.payload?.message;
                localStorage.setItem('authToken', action.payload.data.token);
                localStorage.setItem('authUser', JSON.stringify(action.payload.data.user));
                localStorage.setItem('permissions', JSON.stringify(action.payload.permissions));
                localStorage.setItem('role', action.payload.role);


            })
            .addCase(loginUser.rejected, (state, action) => {
                state.success = false;
                action.payload;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload;
                state.token = action.payload.token;
            })
            .addCase(logoutUser.fulfilled, (state, action) => {
                state.isAuthenticated = true;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            })
            .addCase(fetchGoogleAuthUrl.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGoogleAuthUrl.fulfilled, (state, action) => {
                state.loading = false;
                state.googleAuthUrl = action.payload;
            })
            .addCase(fetchGoogleAuthUrl.rejected, (state, action) => {
                state.loading = false;
            })

            .addCase(handleGoogleCallback.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
                state.message = 'Google login successful';
                
                localStorage.setItem('authToken', action.payload.token);
                localStorage.setItem('authUser', JSON.stringify(action.payload.user));
                localStorage.setItem('permissions', JSON.stringify(action.payload.permissions));
                localStorage.setItem('role', action.payload.role);
            })
            .addCase(handleGoogleCallback.rejected, (state, action) => {
                state.isAuthenticated = false;
                state.message = 'Google login failed';
            });

    },
});

export const { logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
