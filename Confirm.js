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
    NetInfo,
    TouchableOpacity,

} from 'react-native';

import Exit from "./Exit";
import CameraCapture from "./CameraCapture";
let Mailer = require('NativeModules').RNMail;
import * as Globals from "./Globals";

const RNFS = require('react-native-fs');
let Dropbox = require('dropbox');
let dbx = new Dropbox({accessToken: '29ZEV_hyPDAAAAAAAAACuWV-s6bp11c60nwgfFHnP6QjfwWIPnh_aPN3Bm5Cb6Yx'});


export default class Confirm extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            showLoading:false
        };
        this.handleFirstConnectivityChange = this.handleFirstConnectivityChange.bind(this);
        this.checkWifiConnection = this.checkWifiConnection.bind(this);
        NetInfo.isConnected.addEventListener(
            'change',
            this.handleFirstConnectivityChange
        );
    }

    randomNumber() {
        return Array.apply(0, Array(8)).map(function () {
            return (function (charset) {
                return charset.charAt(Math.floor(Math.random() * charset.length))
            }('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'));
        }).join('')
    }

    handleFirstConnectivityChange(isConnected) {
        console.log('Then, is ' + (isConnected ? 'online' : 'offline'));
        this.props.navigator.props.globals.isOnline = isConnected;
        NetInfo.isConnected.removeEventListener(
            'change',
            this.handleFirstConnectivityChange
        );
    }
    checkWifiConnection(){
        NetInfo.isConnected.fetch().then(isConnected => {
            this.props.navigator.props.globals.isOnline = isConnected;
        });


    }

    _renderLoading() {
        if (this.state.showLoading) {
            return (
                <View style={[styles._loadingView, camera_styles.overlay, styles.bottomOverlay]}>
                    <Image
                        source={require('./assets/ajax-loader.gif')}
                    />
                </View>
            );
        } else {
            return null;
        }
    }
    _navigate(name, type = 'Normal') {

        if (name == 'exit') {
            this.setState({showLoading:true});
            let csv = "";
            let that = this;


            if (this.props.navigator.props.globals.movie != "") {
                this.props.navigator.props.globals.target = this.props.navigator.props.globals.movie;
            } else {
                this.props.navigator.props.globals.target = this.props.navigator.props.globals.photo;
            }

            this.props.navigator.props.globals.fileName = this.randomNumber() + "." + this.props.navigator.props.globals.filetype;


            RNFS.readDir(RNFS.DocumentDirectoryPath)
                .then((result) => {
                    console.log('READ LOCAL DIRECTORY');
                    return that.get_emails_csv(that, result);
                })
                .then((statResult) => {

                    if (statResult != false) {
                        if (statResult.isFile()) {
                            return that.append_email_csv(that);
                        }
                    } else {
                        console.log('WRITING FILE');
                        return that.write_emails_file(that);
                    }
                })
                .then((contents) => {
                    // DELETE DROPBOX VERSION TO AVOID CONFLICTS
                    console.log("DELETING DROPBOX FILE");
                    return dbx.filesDelete({path: '/emails.csv'})
                        .then(() => {
                            return that.upload_emails_csv_to_dropbox(that);
                        })
                        .catch(function (error) {
                            console.error("DELETE:", error);
                            return that.upload_emails_csv_to_dropbox(that);
                        });

                }).then((response) => {
                that.props.navigator.push({
                    component: Exit,
                    passProps: {
                        name: name
                    },
                    type: type
                })
            })
                .catch((err) => {
                    console.log(err.message, err.code);
                });



        } else {
            this.props.navigator.props.globals.movie = "";
            this.props.navigator.props.globals.photo = "";
            this.props.navigator.props.globals.filetype = "";

            this.props.navigator.push({
                component: CameraCapture,
                passProps: {
                    email: this.props.navigator.props.globals.user_email
                },
                type: type
            })
        }

    }

    upload_emails_csv_to_dropbox(that) {
        return dbx.filesUpload({
            path: '/emails.csv',
            contents: {uri: RNFS.DocumentDirectoryPath + "/emails.csv"}
        })
            .then(function (response) {
                return that.upload_media_to_dropbox(that);
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    upload_media_to_dropbox(that) {
        console.log("DROPBOX UPLOADED FILE", "emails.csv");


        return dbx.filesUpload({
            path: '/' + that.props.navigator.props.globals.fileName,
            contents: {uri: that.props.navigator.props.globals.target.path}
        })
            .then(function (response) {
                console.log("DROPBOX UPLOADED FILE", that.props.navigator.props.globals.fileName);
                that.props.navigator.props.globals.movie = "";
                that.props.navigator.props.globals.photo = "";

                that.send_email_form(that);
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    send_email_form(that) {
        if (that.props.navigator.props.globals.filetype == "jpg") {
            Mailer.mail({
                subject: 'DAIS VideoBooth',
                recipients: [that.props.navigator.props.globals.user_email],
                ccRecipients: [''],
                bccRecipients: [''],
                body: 'Your file is attached',
                isHTML: true, // iOS only, exclude if false
                attachment: {
                    path: that.props.navigator.props.globals.target.path,  // The absolute path of the file from which to read data.
                    type: "jpg",   // Mime Type: jpg, png, doc, ppt, html, pdf
                    name: that.props.navigator.props.globals.fileName,   // Optional: Custom filename for attachment
                }
            }, (error, event) => {
                if (error) {
                    AlertIOS.alert('Error', 'Could not send mail. Please send a mail to support@example.com');
                }
            });
        } else {


            that.props.navigator.props.globals.downloadLink = dbx.sharingCreateSharedLink({path: '/' + that.props.navigator.props.globals.fileName}).then(function (response) {
                console.log("downloadLink creted:", response);
                Mailer.mail({
                    subject: 'DAIS VideoBooth',
                    recipients: [that.props.navigator.props.globals.user_email],
                    ccRecipients: [''],
                    bccRecipients: [''],
                    body: 'Your file is ready for download at this url (Link will only be available for FOUR hours): ' + response.url,
                    isHTML: true // iOS only, exclude if false

                }, (error, event) => {
                    if (error) {
                        AlertIOS.alert('Error', 'Could not send mail. Please send a mail to support@example.com');
                    }
                });
            }).catch(function (error) {
                console.log("DOWNLOAD LINK ERROR - LINK NOT CREATED", error);
            });
        }
    }

    append_email_csv(that) {

        console.log('APPENDING FILE');
        let return_response = "";
        if (that.props.navigator.props.globals.resetCSV == false) {
            return_response = RNFS.appendFile(RNFS.DocumentDirectoryPath + "/emails.csv", "\n" + that.props.navigator.props.globals.user_email + ", " + that.props.navigator.props.globals.fileName, 'utf8');
        } else {
            return_response = RNFS.writeFile(RNFS.DocumentDirectoryPath + "/emails.csv", that.props.navigator.props.globals.user_email + ", " + that.props.navigator.props.globals.fileName, 'utf8');

        }
        return return_response;
    }

    write_emails_file(that) {
        return RNFS.writeFile(RNFS.DocumentDirectoryPath + "/emails.csv", that.props.navigator.props.globals.user_email + ", " + that.props.navigator.props.globals.fileName, 'utf8')
            .then((success) => {
                console.log('FILE WRITTEN!');
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    get_emails_csv(that, result) {
        that.props.navigator.props.globals.foundFile = false;
        that.props.navigator.props.globals.fileInfo = "";
        for (let i = 0; i < result.length; i++) {
            that.props.navigator.props.globals.fileInfo = result[i];
            if (that.props.navigator.props.globals.fileInfo.name == "emails.csv") {
                console.log('FOUND EMAILS.CSV');
                that.props.navigator.props.globals.foundFile = that.props.navigator.props.globals.fileInfo;
                break;
            }
        }


        return that.props.navigator.props.globals.foundFile;
    }

    render() {

        return (
            <View style={{flex: 1}}>

                <View style={styles.bgImageWrapper}>
                    <Image source={require('./confirm_page.png')} style={styles.bgImage}/>
                </View>
                <Image source={{uri: this.props.navigator.props.globals.photo.path}}
                       style={styles.topOverlay}/>
                <View style={[camera_styles.overlay, styles.bottomOverlay]}>
                    <TouchableHighlight style={styles.redoBtnContainer} onPress={ () => this._navigate("redo") }>
                        <Text> </Text>
                    </TouchableHighlight>

                    <TouchableHighlight style={styles.exitBtnContainer} onPress={ () => this._navigate("exit") }>
                        <Text> </Text>
                    </TouchableHighlight>

                </View>
                {this._renderLoading()}
            </View>
        )
    }
}


const camera_styles = StyleSheet.create({
    container: {
        flex: 1,
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






});
const styles = StyleSheet.create({
    bgImageWrapper: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        zIndex: 0
    },
    _loadingView:{
        backgroundColor: '#ffffff',
        width: Globals.width,
        height:100,
        zIndex:2
    },
    bgImage: {
        flex: 1,
        width: Globals.width,
        height: Globals.height,
        resizeMode: "contain"
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