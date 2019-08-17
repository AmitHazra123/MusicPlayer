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
  TouchableNativeFeedback,
  ToastAndroid,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import {
  Icon,
  Header,
  Left,
  Body,
  Right,
  Content,
  Card,
  CardItem
} from 'native-base';
import { connect } from 'react-redux';
import { setSongStatus } from '../actions/songStatusAction';
import PropTypes from 'prop-types';

const SoundPlayer = require('react-native-sound');
let song = null;

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isScrollEnabled: false,
      pause: true,
      albumlist: [],
      currentMusic: {}
    };
  }

  onGoBack = (songData, state) => {
    song = songData;
    this.setState({ currentMusic: state.currentMusic, pause: state.pause });
  };

  componentDidMount() {
    fetch('https://musicplayerbackend.herokuapp.com/api/album/showlist')
      .then(responseJson => responseJson.json())
      .then(responseJson => {
        this.setState({ albumlist: responseJson });
        if (this.state.albumlist.length > 0) {
          // set action data
          const songStatus = {
            currentMusic: this.state.albumlist[0]
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
        pause: this.state.pause,
        currentMusic
      });
      song = new SoundPlayer(
        `http://storage.googleapis.com/automotive-media/${currentMusic.source}`,
        SoundPlayer.MAIN_BUNDLE,
        error => {
          if (error)
            ToastAndroid.show(
              'Error when init SoundPlayer : (((',
              ToastAndroid.SHORT
            );
        }
      );
    }
  }

  onPressButtonPlayPause(music) {
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
        song.setNumberOfLoops(-1);
      } else {
        song.pause();
      }
      this.setState({ pause: !this.state.pause });
    }
  }

  _cardOnPress(index) {
    this.props.navigation.navigate('AlbumDetails', {
      albumName: this.state.albumlist[index].album,
      pause: this.state.pause,
      song,
      onGoBack: this.onGoBack
    });
  }

  _moreOnPress() {
    Alert.alert('touchable');
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
      outputRange: ['rgba(0, 0, 0, 0.9)', 'white'],
      extrapolate: 'clamp'
    });

    const row = Math.floor(this.state.albumlist.length / 2);
    const rowRem = this.state.albumlist.length % 2;
    let cardsRow = [];
    let count = 0;
    for (let i = 0; i < row; i++) {
      cardsRow.push(
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <TouchableNativeFeedback
            onPress={this._cardOnPress.bind(this, count)}
            background={TouchableNativeFeedback.Ripple('red')}
            delayPressIn={10}
          >
            <Card style={{ height: 275, width: 170 }}>
              <CardItem cardBody>
                <Image
                  source={{
                    uri:
                      'http://storage.googleapis.com/automotive-media/' +
                      this.state.albumlist[count].image
                  }}
                  style={{ flex: 1, height: 210, width: 170 }}
                />
              </CardItem>
              <CardItem>
                <View>
                  <View style={{ width: 135 }}>
                    <Text style={{ fontSize: 14 }}>
                      {this.state.albumlist[count].album}
                    </Text>
                    <Text style={{ fontSize: 8 }}>
                      {this.state.albumlist[count].site}
                    </Text>
                  </View>
                </View>
                <View>
                  <View>
                    <TouchableNativeFeedback
                      onPress={this._moreOnPress.bind(this)}
                    >
                      <View>
                        <Icon name='more' fontSize='18' />
                      </View>
                    </TouchableNativeFeedback>
                  </View>
                </View>
              </CardItem>
            </Card>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback
            onPress={this._cardOnPress.bind(this, count + 1)}
            background={TouchableNativeFeedback.Ripple('red')}
            delayPressIn={10}
          >
            <Card style={{ height: 275, width: 170 }}>
              <CardItem cardBody>
                <Image
                  source={{
                    uri:
                      'http://storage.googleapis.com/automotive-media/' +
                      this.state.albumlist[count + 1].image
                  }}
                  style={{ flex: 1, height: 210, width: 170 }}
                />
              </CardItem>
              <CardItem>
                <View>
                  <View style={{ width: 135 }}>
                    <Text style={{ fontSize: 14 }}>
                      {this.state.albumlist[count + 1].album}
                    </Text>
                    <Text style={{ fontSize: 8 }}>
                      {this.state.albumlist[count + 1].site}
                    </Text>
                  </View>
                </View>
                <View>
                  <View>
                    <TouchableNativeFeedback
                      onPress={this._moreOnPress.bind(this)}
                    >
                      <View>
                        <Icon name='more' fontSize='18' />
                      </View>
                    </TouchableNativeFeedback>
                  </View>
                </View>
              </CardItem>
            </Card>
          </TouchableNativeFeedback>
        </View>
      );
      count += 2;
    }
    if (rowRem == 1) {
      cardsRow.push(
        <View style={{ flexDirection: 'row' }}>
          <TouchableNativeFeedback
            onPress={this._cardOnPress.bind(this, count)}
            background={TouchableNativeFeedback.Ripple('red')}
            delayPressIn={10}
          >
            <Card style={{ height: 275, width: 170 }}>
              <CardItem cardBody>
                <Image
                  source={{
                    uri:
                      'http://storage.googleapis.com/automotive-media/' +
                      this.state.albumlist[count].image
                  }}
                  style={{ flex: 1, height: 210, width: 170 }}
                />
              </CardItem>
              <CardItem>
                <View>
                  <View style={{ width: 135 }}>
                    <Text style={{ fontSize: 14 }}>
                      {this.state.albumlist[count].album}
                    </Text>
                    <Text style={{ fontSize: 8 }}>
                      {this.state.albumlist[count].site}
                    </Text>
                  </View>
                </View>
                <View>
                  <View>
                    <TouchableNativeFeedback
                      onPress={this._moreOnPress.bind(this)}
                    >
                      <View>
                        <Icon name='more' fontSize='18' />
                      </View>
                    </TouchableNativeFeedback>
                  </View>
                </View>
              </CardItem>
            </Card>
          </TouchableNativeFeedback>
        </View>
      );
    }

    return (
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: animatedBackgroundColor
        }}
      >
        <Header style={{ backgroundColor: '#f44336' }}>
          <StatusBar barStyle='light-content' backgroundColor='#f44336' />
          <Left>
            <Icon name='menu' style={{ color: 'white' }} />
          </Left>
          <Body>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
              Music Player
            </Text>
          </Body>
          <Right />
        </Header>
        <Content>
          <View style={{ justifyContent: 'space-around', marginBottom: 90 }}>
            {cardsRow.length == 0 ? (
              <ActivityIndicator size='large' color='#f44336' />
            ) : (
              cardsRow
            )}
          </View>
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

Home.propTypes = {
  setSongStatus: PropTypes.func.isRequired,
  currentSongState: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  currentSongState: state.currentSongState
});

export default connect(
  mapStateToProps,
  { setSongStatus }
)(Home);
