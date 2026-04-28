import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../services/api';

const Ctx = createContext();

const init = { user: null, token: localStorage.getItem('token'), loading: true };

function reducer(state, { type, payload }) {
  switch (type) {
    case 'LOADED':    return { ...state, loading: false };
    case 'SET_USER':  return { ...state, user: payload.user, token: payload.token, loading: false };
    case 'UPDATE':    return { ...state, user: payload };
    case 'LOGOUT':    localStorage.removeItem('token'); return { user: null, token: null, loading: false };
    default: return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);

  useEffect(() => {
    if (state.token) {
      getMe().then(({ data }) => dispatch({ type: 'SET_USER', payload: { user: data.user, token: state.token } }))
             .catch(() => dispatch({ type: 'LOGOUT' }));
    } else {
      dispatch({ type: 'LOADED' });
    }
  }, []); // eslint-disable-line

  const loginUser = useCallback(async (creds) => {
    const { data } = await apiLogin(creds);
    localStorage.setItem('token', data.token);
    dispatch({ type: 'SET_USER', payload: data });
    return data;
  }, []);

  const registerUser = useCallback(async (form) => {
    const { data } = await apiRegister(form);
    localStorage.setItem('token', data.token);
    dispatch({ type: 'SET_USER', payload: data });
    return data;
  }, []);

  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
  const updateUser = useCallback((user) => dispatch({ type: 'UPDATE', payload: user }), []);

  const value = useMemo(() => ({
    ...state, loginUser, registerUser, logout, updateUser
  }), [state, loginUser, registerUser, logout, updateUser]);

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
