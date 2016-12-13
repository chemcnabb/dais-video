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

import Confirm from "./Confirm";
import Camera from 'react-native-camera';
import * as Progress from 'react-native-progress';

const RNFS = require('react-native-fs');
const resetCSV = true;
let Dropbox = require('dropbox');
let dbx = new Dropbox({accessToken: '29ZEV_hyPDAAAAAAAAACuWV-s6bp11c60nwgfFHnP6QjfwWIPnh_aPN3Bm5Cb6Yx'});

var Mailer = require('NativeModules').RNMail;

import * as Globals from "./Globals";




export default class CameraCapture extends React.Component {
    constructor(props) {
        super(props);

        this.camera = null;

        this.state = {
            progress: 0,
            camera: {
                aspect: Camera.constants.Aspect.fill,
                captureTarget: Camera.constants.CaptureTarget.disk,
                type: Camera.constants.Type.front,
                orientation: Camera.constants.Orientation.landscapeRight,
                flashMode: Camera.constants.FlashMode.auto,
                captureAudio: false,
            },
            isRecording: false,
            isCounting: false,
            counter: 3
        };

        this.takePicture = this.takePicture.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.videoRecord = this.videoRecord.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.snapPicture = this.snapPicture.bind(this);
        this.interval = {};

    }

    _navigate(name, type = 'Normal') {
        this.props.navigator.push({
            component: Confirm,
            passProps: {
                name: name
            },
            type: type
        })
    }

    snapPicture(){
        clearInterval(this.interval);
        this.setState({
            camera: {
                ...this.state.camera
            },
        });
        this.camera.capture({rotation: -180})
            .then((data) => {

                this.props.navigator.props.globals.photo = data;
                this.props.navigator.props.globals.movie = "";
                this.props.navigator.props.globals.filetype = "jpg";
                this.props.navigator.props.globals.mimetype = "image/jpeg";

                this._navigate();
            })
            .catch(err => console.error(err));
    }
    takePicture() {
        if (this.camera) {
            this.setState({
                isCounting: true,
                isRecording: true
            });
            this.interval = setInterval((function () {
                this.setState({counter: this.state.counter - 1});
            }).bind(this), 1000);
            setTimeout(this.snapPicture, 3000);

        }
    }

    videoRecord() {
        clearInterval(this.interval);
        this.setState({
            camera: {
                ...this.state.camera,
                captureAudio: true,
            },
        });
        this.camera.capture({mode: Camera.constants.CaptureMode.video, rotation:-90})
            .then((data) => {

                this.props.navigator.props.globals.movie = data;
                this.props.navigator.props.globals.photo = "";
                this.props.navigator.props.globals.filetype = "mov";
                this.props.navigator.props.globals.mimetype = "video/quicktime";

            })
            .catch(err => {
                console.error(err);
            });
        this.setState({
            isRecording: true,
            isCounting: false
        });


        this.interval = setInterval((function () {
            this.setState({progress: this.state.progress += (this.props.navigator.props.globals.width / 240000)});
        }).bind(this), 99);

        setTimeout((function () {
            clearInterval(this.interval);
            this.setState({progress: this.state.progress});
            this.stopRecording();
        }).bind(this), 24000);
    }

    startRecording() {

        if (this.camera) {

            // show countdown
            // oncomplete - remove countdown - call video record
            this.setState({
                isCounting: true,
                isRecording: true
            });
            this.interval = setInterval((function () {
                this.setState({counter: this.state.counter - 1});
            }).bind(this), 1000);
            setTimeout(this.videoRecord, 3000);

        }
    }

    doStop() {
        // nothing
    }

    stopRecording() {

        if (this.camera) {


            this.setState({
                camera: {
                    ...this.state.camera,
                    captureAudio: false,
                },
            });
            this.camera.stopCapture();
            this.setState({
                isRecording: false
            });

            this._navigate();
        }

    }


    render() {
        console.log("CAMERA");
        let that = this;
        return (
            <View style={camera_styles.container}>
                <StatusBar
                    animated
                    hidden
                />
                <Progress.Bar progress={that.state.progress} width={this.props.navigator.props.globals.width} color={'red'} />

                <Camera
                    ref={(cam) => {
                        that.camera = cam;
                    }}
                    style={camera_styles.preview}
                    aspect={that.state.camera.aspect}
                    orientation={that.state.camera.orientation}
                    captureAudio={that.state.camera.captureAudio}
                    captureTarget={that.state.camera.captureTarget}
                    captureQuality="high"
                    type={that.state.camera.type}
                    flashMode={that.state.camera.flashMode}
                    mirrorImage={false}
                />

                <View style={[camera_styles.overlay, camera_styles.bottomOverlay]}>
                    {
                        !that.state.isRecording
                        &&
                        <TouchableOpacity
                            style={camera_styles.captureButton}
                            onPress={that.takePicture}
                        >
                            <Image
                                source={require('./assets/ic_photo_camera_36pt.png')}
                            />
                        </TouchableOpacity>
                        ||
                        null
                    }
                    <View style={camera_styles.buttonsSpace}/>
                    {
                        !that.state.isRecording
                        &&
                        <TouchableOpacity
                            style={camera_styles.captureButton}
                            onPress={that.startRecording}
                        >
                            <Image
                                source={require('./assets/ic_videocam_36pt.png')}
                            />
                        </TouchableOpacity>
                        || !this.state.isCounting
                        &&
                        <View
                            style={camera_styles.captureButtonRed}

                        >
                            <Image
                                source={require('./assets/ic_stop_36pt.png')}
                            />
                        </View>
                        ||
                        <View
                            style={camera_styles.countingButtonRed}

                        >
                            <Text style={camera_styles.countingButtonText}>{this.state.counter}</Text>
                        </View>
                    }
                </View>

            </View>
        );
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