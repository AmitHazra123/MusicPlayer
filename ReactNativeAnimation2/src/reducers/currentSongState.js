import { SET_SONG_STATUS, GET_SONG_STATUS } from '../actions/types';
import { Alert } from 'react-native';

const initialState = [];

export default function(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_SONG_STATUS:
      return [...state, payload];
    case GET_SONG_STATUS:
      return [...state];
    default:
      return state;
  }
}
