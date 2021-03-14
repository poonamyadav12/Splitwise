import React, { Component, useEffect, useState } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';
import cookie from 'react-cookies';
import { ListGroup, Card, ButtonGroup, Button, Container, Row, Col, Form, InputGroup, FormControl, Alert } from 'react-bootstrap';
import { GrGroup } from 'react-icons/gr';
import { TransactionView } from '../Transactions/TransactionView';
import { alertActions } from '../../_actions';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import { AlertMessages } from '../Alert/Alert';
var dateFormat = require("dateformat");


class ActivityView extends React.Component {

    constructor(props) {
        super(props);
        this.state = { recentActivities: [], };
    }

    async componentDidMount() {
        await this.fetchData();
    }

    async fetchData() {
        try {
            if (this.props.user) {

                const recentActivity = await axios.get(`http://localhost:3001/user/activity?userId=${this.props.user.email}`);

                this.setState({
                    recentActivities: recentActivity.data,
                });
            }
        } catch (err) {
            console.log("Error in Group View " + err);
            this.props.errorAlert(["Something went wrong. Please try again"]);
        }
    }

    async forceReload() {
        await this.fetchData();
    }

    render() {
        return <>
            {this.state.recentActivities.length > 0 && <Card>
                <Card.Header>

                    <ListGroup.Item>
                        <h3> Recent Activity</h3>
                    </ListGroup.Item>

                </Card.Header>
                <ListGroup>
                    {this.state.recentActivities.map((activity,index) => <ConnectedSingleActivityView activity={activity} setGroupView={this.props.setGroupView} index={index}></ConnectedSingleActivityView>)}
                </ListGroup>
            </Card>}
        </>;
    }
}

const SingleActivityView = (props) => {
    const createrName = props.user.email === props.activity.creator.email ? 'you' : props.activity.creator.first_name;
    const groupName = props.activity.group.name;
    const type = props.activity.type;
    let header = null;
    switch (type) {
        case 'GROUP_CREATION':
            header = <><b>{createrName}</b>&nbsp;created {' '}<b>{groupName}</b></>;
            break;
        case 'MEMBER_ADDED':
            header = <><b>{createrName}</b>&nbsp;added {' '}<b>{props.activity.added.first_name}</b>{' in '}<b>{groupName}</b></>;
            break;
        case 'TRANSACTION_ADDED':
            header = <><b>{createrName}</b>&nbsp;added {' '}<b>{props.activity.transaction.description}</b>{' in '}<b>{groupName}</b></>;
            break;
        default:
            return null;
    }

    const date = props.activity.createdAt;
    return (
    <ListGroup.Item key={props.index} onClick={()=>props.setGroupView(props.activity.group.id)}>
        <Container>
            <Row>
                <div>{header}</div>
            </Row>
            <Row>
                <div>{dateFormat(date, "mmm d")}</div>
            </Row>
        </Container>
    </ListGroup.Item>);
}


function mapState(state) {
    const { user } = state.authentication;
    return { user };
}

const actionCreators = {
    errorAlert: alertActions.error,
    clearAlert: alertActions.clear,
};


const connectedActivityView = connect(mapState, actionCreators)(ActivityView);
const ConnectedSingleActivityView = connect(mapState, actionCreators)(SingleActivityView);
export { connectedActivityView as ActivityView };
