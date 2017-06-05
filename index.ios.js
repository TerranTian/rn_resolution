/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  Image,
  View
} from 'react-native';

import Resolution from "./Resolution"

export default class tets extends Component {
  render() { 
    return (
      <Resolution.FixWidthView style={styles.container}>
        <Image source={require("./assets/bg_day.jpg")} style={{position:"absolute"}}/>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>
      </Resolution.FixWidthView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#ff0000',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    backgroundColor:"transparent"
  },
  instructions: {
    backgroundColor:"transparent",
    textAlign: 'center',
    color: 0xffff,
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('rn_resolution', () => tets);
