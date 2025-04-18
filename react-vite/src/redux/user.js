const SET_USER_BALANCE = 'user/setUserBalance';


const setUserBalance = (balance) => ({
  type: SET_USER_BALANCE,
  payload: balance
});

export const thunkFetchUserBalance = () => async (dispatch) => {
  const response = await fetch('/api/users/me/balance');
  if (response.ok) {
    const data = await response.json();
    dispatch(setUserBalance(data.total_balance));
  }
};

export const thunkAddToUserBalance = (amount) => async (dispatch) => {
    console.log("Dispatching balance update:", amount);
    const response = await fetch('/api/users/me/balance', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
  
    if (response.ok) {
      const data = await response.json();
      dispatch(setUserBalance(data.total_balance)); // Optional: or re-fetch with thunkFetchUserBalance()
    }
  };

const initialState = {
  balance: null,
};

function userReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER_BALANCE:
      return { ...state, balance: action.payload };
    default:
      return state;
  }
}

export default userReducer;
