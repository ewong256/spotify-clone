const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

// Action creators
const setUser = (user) => ({
  type: SET_USER,
  payload: user
});

const removeUser = () => ({
  type: REMOVE_USER
});

// Thunk to authenticate the user by checking if a token exists in localStorage
export const thunkAuthenticate = () => async (dispatch) => {
  const token = localStorage.getItem('authToken');

  if (token) {
    // Make a request to the backend to validate the session token
    const response = await fetch("/api/auth/", {
      headers: {
        'Authorization': `Bearer ${token}` // Include token in the request headers
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.errors) {
        return;
      }

      // Dispatch setUser to store user info if authenticated
      dispatch(setUser(data));
    } else {
      // If the response is not ok (token is invalid or expired), clear the token and user state
      localStorage.removeItem('authToken');
      dispatch(removeUser());
    }
  } else {
    // If no token, user is not authenticated
    dispatch(removeUser());
  }
};

// Thunk for login action
export const thunkLogin = (credentials) => async (dispatch) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('authToken', data.token); // Save token in localStorage after login
    dispatch(setUser(data));
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return errorMessages;
  } else {
    return { server: "Something went wrong. Please try again" };
  }
};

// Thunk for signup action
export const thunkSignup = (user) => async (dispatch) => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('authToken', data.token); // Save token in localStorage after signup
    dispatch(setUser(data));
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return errorMessages;
  } else {
    return { server: "Something went wrong. Please try again" };
  }
};

// Thunk for logout action
export const thunkLogout = () => async (dispatch) => {
  await fetch("/api/auth/logout");
  localStorage.removeItem('authToken'); // Remove token from localStorage on logout
  dispatch(removeUser());
};

// Initial state for session
const initialState = { user: null };

// Reducer for session management
function sessionReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    default:
      return state;
  }
}

export default sessionReducer;
