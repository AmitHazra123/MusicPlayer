import { SET_SONG_STATUS, GET_SONG_STATUS } from './types';
import { Alert } from 'react-native';

// action 1
export const setSongStatus = songStatus => dispatch => {
  //Alert.alert('hello');
  dispatch({
    type: SET_SONG_STATUS,
    payload: { songStatus }
  });
};

// action 2
export const getSongStatus = () => dispatch => {
  dispatch({
    type: GET_SONG_STATUS,
    payload: {}
  });
};
