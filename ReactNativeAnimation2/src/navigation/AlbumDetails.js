import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Animated,
  Text,
  Dimensions,
  PanResponder,
  Slider,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
  StatusBar,
  TouchableNativeFeedback,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Icon, Header, Left, Body, Right, Content } from 'native-base';
import { setSongStatus } from '../actions/songStatusAction';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const SoundPlayer = require('react-native-sound');
let song = null;

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

class AlbumDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isScrollEnabled: false,
      pause: true,
      musicList: [],
      currentMusic: {}
    };
  }

  componentDidMount() {
    const albumName = this.props.navigation.getParam('albumName');
    fetch(
      `https://musicplayerbackend.herokuapp.com/api/album/albumdetails/${albumName}`
    )
      .then(responseJson => responseJson.json())
      .then(responseJson => {
        this.setState({ musicList: responseJson });
        if (this.state.musicList.length > 0) {
          // set action data
          const songStatus = {
            currentMusic: this.state.currentMusic
          };

          // action calling
          this.props.setSongStatus(songStatus);
        }
      })
      .catch(err => Alert.alert('err'));
  }

  componentWillMount() {
    this.scrollOffset = 0;

    this.animation = new Animated.ValueXY({ x: 0, y: SCREEN_HEIGHT - 90 });

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (
          (this.state.isScrollEnabled &&
            this.scrollOffset <= 0 &&
            gestureState.dy > 0) ||
          (!this.state.isScrollEnabled && gestureState.dy < 0)
        ) {
          return true;
        } else {
          return false;
        }
      },
      onPanResponderGrant: (evt, gestureState) => {
        this.animation.extractOffset();
      },
      onPanResponderMove: (evt, gestureState) => {
        this.animation.setValue({ x: 0, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.moveY > SCREEN_HEIGHT - 120) {
          Animated.spring(this.animation.y, {
            toValue: 0,
            tension: 1
          }).start();
        } else if (gestureState.moveY < 120) {
          Animated.spring(this.animation.y, {
            toValue: 0,
            tension: 1
          }).start();
        } else if (gestureState.dy < 0) {
          this.setState({ isScrollEnabled: true });
          Animated.spring(this.animation.y, {
            toValue: -SCREEN_HEIGHT + 90,
            tension: 1
          }).start();
        } else if (gestureState.dy > 0) {
          this.setState({ isScrollEnabled: false });
          Animated.spring(this.animation.y, {
            toValue: SCREEN_HEIGHT - 110,
            tension: 1
          }).start();
        }
      }
    });
  }

  componentWillReceiveProps(props) {
    if (props.currentSongState.length > 0) {
      const { pause, currentMusic } = props.currentSongState[0].songStatus;
      this.setState({
        pause: props.navigation.getParam('pause'),
        currentMusic
      });

      song = props.navigation.getParam('song');
    }
  }

  onPressButtonPlayPause(index) {
    //this.componentWillMount();
    if (song != null) {
      if (this.state.pause) {
        // play resume
        song.play(success => {
          if (!success)
            ToastAndroid.show(
              'Error when play SoundPlayer : (((',
              ToastAndroid.SHORT
            );
        });
      } else song.pause();
      this.setState({ pause: !this.state.pause });
    }
  }

  _onBackButton() {
    this.props.navigation.state.params.onGoBack(song, this.state);
    this.props.navigation.goBack();
  }

  _moreOnPress() {
    Alert.alert('touchable');
  }

  _onSetSong(songData) {
    if (this.state.musicList.length > 0) {
      song.pause();
      this.setState({ pause: true });

      song = new SoundPlayer(
        `http://storage.googleapis.com/automotive-media/${songData.source}`,
        SoundPlayer.MAIN_BUNDLE,
        error => {
          if (error)
            ToastAndroid.show(
              'Error when init SoundPlayer : (((',
              ToastAndroid.SHORT
            );
        }
      );
      this.setState({ currentMusic: songData });

      song.play(success => {
        if (!success)
          ToastAndroid.show(
            'Error when play SoundPlayer : (((',
            ToastAndroid.SHORT
          );
      });

      this.setState({ pause: false });
    }
  }

  render() {
    const animatedHeight = {
      transform: this.animation.getTranslateTransform()
    };

    animatedImageHeight = this.animation.y.interpolate({
      inputRange: [0, SCREEN_HEIGHT - 90],
      outputRange: [200, 32],
      extrapolate: 'clamp'
    });

    animatedSongTitleOpacity = this.animation.y.interpolate({
      inputRange: [0, SCREEN_HEIGHT - 500, SCREEN_HEIGHT - 90],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp'
    });

    animatedImageMarginLeft = this.animation.y.interpolate({
      inputRange: [0, SCREEN_HEIGHT - 90],
      outputRange: [SCREEN_WIDTH / 2 - 100, 10],
      extrapolate: 'clamp'
    });

    animatedHeaderHeight = this.animation.y.interpolate({
      inputRange: [0, SCREEN_HEIGHT - 90],
      outputRange: [SCREEN_HEIGHT / 2, 90],
      extrapolate: 'clamp'
    });

    animatedSongDetailsOpacity = this.animation.y.interpolate({
      inputRange: [0, SCREEN_HEIGHT - 500, SCREEN_HEIGHT - 90],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp'
    });

    animatedBackgroundColor = this.animation.y.interpolate({
      inputRange: [0, SCREEN_HEIGHT - 90],
      outputRange: ['rgba(0, 0, 0, 0.5)', 'white'],
      extrapolate: 'clamp'
    });

    const row = this.state.musicList.length;
    let musicsRow = [];
    for (let i = 0; i < row; i++) {
      musicsRow.push(
        <TouchableNativeFeedback
          onPress={this._onSetSong.bind(this, this.state.musicList[i])}
          delayPressIn={10}
        >
          <View
            style={{
              flex: 1,
              marginTop: 20,
              flexDirection: 'row',
              justifyContent: 'space-around'
            }}
          >
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '900' }}>{i + 1}</Text>
            </View>
            <View style={{ width: 120 }}>
              <Text style={{ fontSize: 16, fontWeight: '900' }}>
                {this.state.musicList[i].title}
              </Text>
              <Text style={{ fontSize: 12 }}>
                {this.state.musicList[i].site}
              </Text>
            </View>
            <View
              style={{
                marginLeft: 50,
                marginTop: 8,
                alignItems: 'center'
              }}
            >
              <TouchableNativeFeedback
                delayPressIn={10}
                onPress={this._moreOnPress.bind(this)}
              >
                <View
                  style={{
                    height: 30,
                    width: 30
                  }}
                >
                  <Icon name='more' style={{ fontSize: 20 }} />
                </View>
              </TouchableNativeFeedback>
            </View>
          </View>
        </TouchableNativeFeedback>
      );
    }
    return (
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: animatedBackgroundColor
        }}
      >
        <Header transparent>
          <StatusBar barStyle='light-content' backgroundColor='#f44336' />
          <Left>
            <TouchableNativeFeedback
              delayPressIn={10}
              onPress={this._onBackButton.bind(this)}
            >
              <View style={{ height: 30, width: 30, borderRadius: 15 }}>
                <Icon name='arrow-back' style={{ color: 'black' }} />
              </View>
            </TouchableNativeFeedback>
          </Left>
          <Body />
          <Right />
        </Header>
        <Content>
          {this.state.musicList.length > 0 ? (
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>
                <Image
                  source={{
                    uri: `http://storage.googleapis.com/automotive-media/${
                      this.state.musicList[0].image
                    }`
                  }}
                  style={{ width: Dimensions.get('window').width, height: 300 }}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'flex-end',
                  marginRight: 40,
                  marginTop: 20
                }}
              >
                <TouchableNativeFeedback
                  onPress={this.onPressButtonPlayPause.bind(this)}
                >
                  <View
                    style={{
                      borderRadius: 25,
                      height: 50,
                      width: 50,
                      backgroundColor: '#f44336',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon
                      name={this.state.pause ? 'play' : 'pause'}
                      style={{ fontSize: 40, color: 'white' }}
                    />
                  </View>
                </TouchableNativeFeedback>
              </View>
              <View
                style={{
                  flex: 1,
                  marginTop: 20,
                  flexDirection: 'row',
                  justifyContent: 'space-around'
                }}
              >
                <View style={{ width: 220 }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                    {this.state.musicList[0].album}
                  </Text>
                  <Text style={{ fontSize: 14 }}>
                    {this.state.musicList[0].site}
                  </Text>
                </View>
                <View style={{ marginTop: 8, alignItems: 'center' }}>
                  <TouchableNativeFeedback
                    onPress={this._moreOnPress.bind(this)}
                  >
                    <View style={{ height: 30, width: 30 }}>
                      <Icon name='more' fontSize='18' />
                    </View>
                  </TouchableNativeFeedback>
                </View>
              </View>
              <ScrollView style={{ marginBottom: 120 }}>{musicsRow}</ScrollView>
            </View>
          ) : (
            <ActivityIndicator size='large' color='#f44336' />
          )}
        </Content>
        <Animated.View
          style={[
            animatedHeight,
            {
              position: 'absolute',
              left: 0,
              right: 0,
              zIndex: 10,
              elevation: Platform.OS === 'android' ? 10 : 0,
              backgroundColor: 'white',
              height: SCREEN_HEIGHT
            }
          ]}
        >
          <ScrollView
            scrollEnabled={this.state.isScrollEnabled}
            scrollEventThrottle={16}
            onScroll={event => {
              this.scrollOffset = event.nativeEvent.contentOffset.y;
            }}
          >
            <Animated.View
              {...this.panResponder.panHandlers}
              style={{
                height: animatedHeaderHeight,
                borderTopWidth: 1,
                borderTopColor: '#ebe5e5',
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <View
                style={{
                  flex: 4,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <Animated.View
                  style={{
                    height: animatedImageHeight,
                    width: animatedImageHeight,
                    marginLeft: animatedImageMarginLeft
                  }}
                >
                  <Image
                    style={{ flex: 1, width: null, height: null }}
                    source={{
                      uri: `http://storage.googleapis.com/automotive-media/${
                        this.state.currentMusic.image
                      }`
                    }}
                  />
                </Animated.View>
                <Animated.Text
                  style={{
                    opacity: animatedSongTitleOpacity,
                    fontSize: 18,
                    paddingLeft: 10
                  }}
                >
                  {this.state.currentMusic.title}
                </Animated.Text>
              </View>
              <Animated.View
                style={{
                  opacity: animatedSongTitleOpacity,
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-around'
                }}
              >
                <TouchableOpacity
                  onPress={this.onPressButtonPlayPause.bind(
                    this,
                    this.state.currentMusic.music
                  )}
                >
                  <Icon
                    name={this.state.pause ? 'play' : 'pause'}
                    style={{ fontSize: 32 }}
                  />
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
            <Animated.View
              style={{
                height: animatedHeaderHeight,
                opacity: animatedSongDetailsOpacity
              }}
            >
              <View
                style={{
                  height: 40,
                  width: SCREEN_WIDTH,
                  alignItems: 'center'
                }}
              >
                <Slider
                  style={{ width: 300 }}
                  step={1}
                  minimumValue={18}
                  maximumValue={71}
                  value={18}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'flex-end'
                }}
              >
                <Text style={{ fontWeight: 'bold', fontSize: 22 }}>
                  {this.state.currentMusic.title}
                </Text>
                <Text style={{ fontSize: 16, color: 'pink' }}>
                  {this.state.currentMusic.site}
                </Text>
              </View>
              <View
                style={{
                  flex: 2,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around'
                }}
              >
                <Icon name='rewind' style={{ fontSize: 40 }} />
                <TouchableOpacity
                  onPress={this.onPressButtonPlayPause.bind(this)}
                >
                  <Icon
                    name={this.state.pause ? 'play' : 'pause'}
                    style={{ fontSize: 32 }}
                  />
                </TouchableOpacity>
                <Icon name='fastforward' style={{ fontSize: 40 }} />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 10,
                  paddingBottom: 20
                }}
              >
                <Icon name='add' style={{ fontSize: 32, color: '#fa95ed' }} />
                <Icon name='more' style={{ fontSize: 32, color: '#fa95ed' }} />
              </View>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({});

AlbumDetails.propTypes = {
  setSongStatus: PropTypes.func.isRequired,
  currentSongState: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  currentSongState: state.currentSongState
});

export default connect(
  mapStateToProps,
  { setSongStatus }
)(AlbumDetails);
