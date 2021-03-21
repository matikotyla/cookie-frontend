import axios from "axios";
import {
  LOGIN_USER,
  LOGOUT_USER,
  GET_USER_DATA_SUCCESS,
  GET_USER_DATA_FAILURE,
  SAVE_USER_DATA_SUCCESS,
  SAVE_USER_DATA_FAILURE,
} from "../types.js";
import {
  addSuccessNotification,
  addErrorNotification,
} from "./notification.js";
import { showLoader, hideLoader } from "./ui.js";
import { getAchievements } from "./data.js";
import { parseJWT } from "../../utils/token.js";

export const loginUser = (token) => async (dispatch) => {
  localStorage.setItem("token", token);
  dispatch(showLoader());

  const user = parseJWT(token);

  dispatch({
    type: LOGIN_USER,
    payload: {
      id: user.id,
      name: user.name,
    },
  });

  // fetch user data
  await dispatch(getAchievements());
  await dispatch(getUserData());

  // dispatch(hideLoader());

  setTimeout(() => {
    dispatch(hideLoader());
  }, 3000);
};

export const logoutUser = () => (dispatch) => {
  localStorage.removeItem("token");

  dispatch({
    type: LOGOUT_USER,
    payload: null,
  });

  dispatch(addSuccessNotification("Logout successfull"));
};

export const getUserDataSuccess = (user) => ({
  type: GET_USER_DATA_SUCCESS,
  payload: user,
});

export const getUserDataFailure = () => ({
  type: GET_USER_DATA_FAILURE,
  payload: null,
});

export const getUserData = () => async (dispatch) => {
  try {
    const { data } = await axios.get("/api/cookie/data");
    dispatch(getUserDataSuccess(data));
  } catch (error) {
    dispatch(getUserDataFailure());
  }
};

export const saveUserProgressSuccess = (data) => ({
  type: SAVE_USER_DATA_SUCCESS,
  payload: data,
});

export const saveUserProgressFailure = () => ({
  type: SAVE_USER_DATA_FAILURE,
  payload: null,
});

export const saveUserProgress = (counter) => async (dispatch, getState) => {
  const { user } = getState();

  try {
    if (user.authenticated) {
      await axios.patch("/api/cookie/progress", {
        id: user.id,
        counter,
        achievements: user.achievements,
      });
      dispatch(
        saveUserProgressSuccess({
          counter,
          achievements: user.achievements,
        })
      );
      dispatch(addSuccessNotification("Progress saved succesfully"));
    }
  } catch (error) {
    dispatch(addErrorNotification("Invalid data"));
    dispatch(saveUserProgressFailure());
  }
};

export const saveUserAchievementSuccess = (data) => ({
  type: SAVE_USER_DATA_SUCCESS,
  payload: data,
});

export const saveUserAchievementFailure = () => ({
  type: SAVE_USER_DATA_FAILURE,
  payload: null,
});

export const saveUserAchievement = (ids, counter) => async (
  dispatch,
  getState
) => {
  const { user } = getState();

  try {
    if (user.authenticated) {
      await axios.post("/api/cookie/achievement", {
        ids,
        counter,
      });
      dispatch(addSuccessNotification("Achievement unlocked"));
      dispatch(
        saveUserAchievementSuccess({
          counter,
          achievements: [...user.achievements, ...ids],
        })
      );
    }
  } catch (error) {
    console.error(error);
    dispatch(addErrorNotification("Couldn't add achievement"));
    dispatch(saveUserAchievementFailure());
  }
};
