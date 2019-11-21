import React, { Component } from 'react';
import
{
    ScrollView, Alert,
    Text, View, Image, StatusBar, RefreshControl,
    BackHandler, AsyncStorage, Dimensions, TouchableOpacity,
    Platform, ActivityIndicator
} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome'

import { SearchBar } from 'react-native-elements';

import _ from "lodash";

import { TaskStyle } from './TaskStyle';

import { GetCreatedByme } from '../../../../services/UserService/TaskService';

import * as actions from '../../../../common/actions';

import { Actions } from 'react-native-router-flux';

import TaskLists from "./CreatedbymeComponent"

var screen = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;
function StatusBarPlaceHolder() {
    return (
        <View style={{
            width: "100%",
            height: STATUS_BAR_HEIGHT,
            backgroundColor: '#F3F3F3',
        }}>
            <StatusBar />
        </View>
    );
}
export default class CreateByMe extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            progressVisible: false,
            refreshing: false,
            userId: "",
            taskList: [],
        }
        this.arrayholder = [];
    }

    _onRefresh = async () =>
    {
        this.setState({ refreshing: true });
        setTimeout(function ()
        {
            this.setState({
                refreshing: false,
            });

        }.bind(this), 2000);

        this.getCreateByme(this.state.userId, true);
    };

    async componentDidMount()
    {
        const uId = await AsyncStorage.getItem("userId");
        this.setState({ userId: uId });
        this.getCreateByme(uId, true);


        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount()
    {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
        this.getCreateByme(uId, false);
    }

    handleBackButton = () =>
    {
         BackHandler.exitApp()
        return true;
    }
    searchFilterFunction = text =>
    {
        this.setState({
            value: text,
        });

        const newData = this.arrayholder.filter(item =>
        {
            const itemData = `${item.Title.toUpperCase()} ${item.Title.toUpperCase()} ${item.Title.toUpperCase()}`;
            const textData = text.toUpperCase();

            return itemData.indexOf(textData) > -1;
        });
        this.setState({
            taskList: newData,
        });
    };

    renderHeader = () =>
    {
        return (
            <ScrollView scrollEnabled={false}>


                <SearchBar
                    placeholder="Type Here..."
                    style={{ position: 'absolute', zIndex: 1 }}
                    lightTheme
                    containerStyle={{ backgroundColor: '#f6f7f9', }}
                    inputContainerStyle={{ backgroundColor: 'white', }}
                    round
                    onChangeText={text => this.searchFilterFunction(text)}
                    autoCorrect={false}
                    value={this.state.value}
                />
            </ScrollView>
        );
    };

    getCreateByme = async (userId, isProgress) =>
    {
        try
        {
            this.setState({ progressVisible: isProgress });
            await GetCreatedByme(userId)
                .then(res =>
                {
                    this.setState({ taskList: res.result, progressVisible: false });
                    this.arrayholder = res.result;
                    console.log(this.arrayholder, 'taskresutl...');
                })
                .catch(() =>
                {
                    this.setState({ progressVisible: false });
                    console.log("error occured");
                });

        } catch (error)
        {
            this.setState({ progressVisible: false });
            console.log(error);
        }
    }

    goToCreateTask()
    {
        actions.push("CreateTask", {});
    }

    gotoDetails(task)
    {
        actions.push("ViewTask", { TaskModel: task, arrayholder: this.arrayholder, });
    }

    render()
    {

        return (
            <View
                style={TaskStyle.container}>
              <StatusBarPlaceHolder />
                <View
                    style={TaskStyle.HeaderContent}>
                    <View
                        style={TaskStyle.HeaderFirstView}>
                        <TouchableOpacity
                            style={TaskStyle.HeaderMenuicon}
                            onPress={() => { Actions.drawerOpen(); }}>
                            <Image resizeMode="contain" style={TaskStyle.HeaderMenuiconstyle}
                                source={require('../../../../assets/images/menu_b.png')}>
                            </Image>
                        </TouchableOpacity>
                        <View
                            style={TaskStyle.HeaderTextView}>
                            <Text
                                style={TaskStyle.HeaderTextstyle}>
                                TASK
                            </Text>
                        </View>
                    </View>
                    <View
                        style={TaskStyle.createTaskButtonContainer}>
                        <TouchableOpacity
                            onPress={() => this.goToCreateTask()}
                            style={TaskStyle.createTaskButtonTouch}>
                            <View style={TaskStyle.plusButton}>
                                <FontAwesome
                                    name="plus" size={18} color="#ffffff">
                                </FontAwesome>
                            </View>
                            <View style={TaskStyle.ApplyTextButton}>
                                <Text style={TaskStyle.ApplyButtonText}>
                                    TASK
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {this.state.progressVisible == true ?
                    (<ActivityIndicator size="large" color="#1B7F67"
                        style={TaskStyle.loaderIndicator} />) : null}
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh.bind(this)}
                        />
                    }
                >
                    <TaskLists itemList={this.state.taskList} headerRenderer={this.renderHeader()} />
                </ScrollView>

            </View >
        )
    }
}
