import React, { Component } from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import Home from './src/navigation/Home';
import AlbumDetails from './src/navigation/AlbumDetails';

// Redux
import { Provider } from 'react-redux';
import store from './src/store';

let RootStack = createStackNavigator(
  {
    Home: {
      title: 'Music Player',
      screen: Home
    },
    AlbumDetails: {
      screen: AlbumDetails
    }
  },
  {
    initialRouteName: 'Home',
    headerMode: 'none'
  }
);

let Navigation = createAppContainer(RootStack);

export default class App extends Component {
  componentDidMount() {
    console.disableYellowBox = true;
  }

  render() {
    return (
      <Provider store={store}>
        <Navigation />
      </Provider>
    );
  }
}
