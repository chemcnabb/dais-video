/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Navigator,
    Image,
    TouchableHighlight,
    Dimensions,
    TextInput,
    StatusBar,

    TouchableOpacity,

} from 'react-native';

import Home from "./Home";

import * as Globals from "./Globals";



export class DaisVideo extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            globals : Globals
        }
    }
    renderScene(route, navigator) {
        return <route.component navigator={navigator} {...route.passProps} />
    }

    configureScene(route, routeStack){
        if (route.type == 'Modal') {
            return Navigator.SceneConfigs.FloatFromBottom
        }
        return Navigator.SceneConfigs.PushFromRight
    }

    render() {
        console.log("DAIS VIDEO");
        return (
            <Navigator
                configureScene={ this.configureScene }
                style={{flex: 1}}
                initialRoute={{component: Home}}
                renderScene={ this.renderScene }
                globals={this.state.globals}
            />
        )
    }
}



const camera_styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    overlay: {
        position: 'absolute',
        padding: 16,
        right: 0,
        left: 0,
        alignItems: 'center',
    },
    topOverlay: {
        top: 0,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bottomOverlay: {
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 40,
    }, captureButtonRed: {
        padding: 15,
        backgroundColor: 'red',
        borderRadius: 40,
    },
    countingButtonRed: {
        padding: 15,
        backgroundColor: 'red',
        borderRadius: 40,
        bottom: 350
    },
    countingButtonText: {
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 18,
        paddingRight: 18,
        color: "white",
        fontSize: 36,


    },
    typeButton: {
        padding: 5,
    },
    flashButton: {
        padding: 5,
    },
    buttonsSpace: {
        width: 10,
    },
});
var styles = StyleSheet.create({
    bgImageWrapper: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0
    },
    cameraSnap: {
        position: 'absolute',
        top: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: 100
    },
    bgImage: {
        flex: 1,
        width: Globals.width,
        height: Globals.height,
        resizeMode: "contain"
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10
    },
    bottomOverlay: {
        bottom: 110,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    exitBtnContainer: {

        padding: 15,
        backgroundColor: 'transparent',
        borderRadius: 40,
        right: -20,
        width: 80,
        height: 80
    },
    redoBtnContainer: {
        left: -15,
        padding: 15,
        backgroundColor: 'transparent',
        borderRadius: 40,
        width: 80,
        height: 80
    }

});

AppRegistry.registerComponent('DaisVideo', () => DaisVideo);
