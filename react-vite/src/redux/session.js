const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';
const SET_TOTAL_BALANCE = "session/SET_TOTAL_BALANCE";

const setUser = (user) => ({
  type: SET_USER,
  payload: user
});

const setTotalBalance = (newBalance) => ({
  type: SET_TOTAL_BALANCE,
  payload: newBalance,
});

const removeUser = () => ({
  type: REMOVE_USER
});

export const thunkAuthenticate = () => async (dispatch) => {
	const response = await fetch("/api/auth/");
	if (response.ok) {
		const data = await response.json();
		if (data.errors) {
			return;
		}

		dispatch(setUser(data));
	}
};

export const thunkLogin = (credentials) => async dispatch => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });

  if(response.ok) {
    const data = await response.json();
    dispatch(setUser(data));
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return errorMessages
  } else {
    return { server: "Something went wrong. Please try again" }
  }
};

export const thunkSignup = (user) => async (dispatch) => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  });

  if(response.ok) {
    const data = await response.json();
    dispatch(setUser(data));
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return errorMessages
  } else {
    return { server: "Something went wrong. Please try again" }
  }
};

export const thunkLogout = () => async (dispatch) => {
  await fetch("/api/auth/logout");
  dispatch(removeUser());
};

export const thunkUpdateTotalBalance = (newBalance) => async (dispatch) => {
  try {
    const res = await fetch("/api/users/update_balance", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ total_balance: newBalance }),
    });

    if (res.ok) {
      const updatedUser = await res.json();
      dispatch(setTotalBalance(updatedUser.total_balance));
    } else {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to update total balance");
    }
  } catch (error) {
    console.error("Balance update failed:", error);
  }
};


const initialState = { user: null };

function sessionReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case SET_TOTAL_BALANCE:
      return {
        ...state,
        user: {
          ...state.user,
          total_balance: action.payload,
        },
      };
    case REMOVE_USER:
      return { ...state, user: null };

    default:
      return state;
  }
}

export default sessionReducer;
