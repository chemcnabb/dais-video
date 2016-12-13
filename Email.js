/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Navigator,
    Image,
    TouchableHighlight,
    TextInput,
} from 'react-native';
import CameraCapture from "./CameraCapture";

import * as Globals from "./Globals";




export default class Email extends Component{
    constructor(props){
        super(props);
        console.log("EMAIL PROPS", this.props.navigator.props.globals);
        this.state = {text: ''};
        this._navigate = this._navigate.bind(this);
        this.validateEmail = this.validateEmail.bind(this);
    }
    _navigate(text, type = 'Normal') {
        this.props.navigator.props.globals.user_email = text;
        console.log("EMAIL NAVIGATE");
        if (!!this.props.navigator.props.globals.user_email) {
            if (!!this.validateEmail(this.props.navigator.props.globals.user_email)) {
                this.props.navigator.push({
                    component: CameraCapture,
                    passProps: {
                        email: this.props.navigator.props.globals.user_email
                    },
                    type: type
                })
            }
        }
    }
    validateEmail(user_email){
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(this.props.navigator.props.globals.user_email);
    }

    render() {
        console.log("EMAIL");
        let that = this;
        return (
            <View style={{flex: 1}}>

                <View style={styles.bgImageWrapper}>
                    <TextInput
                        style={{
                            width: 272,
                            height: 38,
                            borderColor: 'black',
                            borderWidth: .5,
                            marginTop: 290.2,
                            marginLeft: 376,
                            position: 'absolute',
                            fontSize: 18,
                            textAlign: 'center',
                            textAlignVertical: 'center',
                            zIndex: 100
                        }}
                        autoCapitalize="characters"
                        onChangeText={(text) => that.setState({text})}
                        value={that.state.text}
                    />

                    <TouchableHighlight style={styles.buttonContainer}
                                        onPress={ () => that._navigate(that.state.text) }>
                        <Image source={require('./email_page.png')} style={styles.bgImage}/>
                    </TouchableHighlight>
                </View>

            </View>
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