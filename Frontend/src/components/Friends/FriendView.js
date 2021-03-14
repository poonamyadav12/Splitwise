import React, { Component, useEffect, useState } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';
import cookie from 'react-cookies';
import { ListGroup, Card, ButtonGroup, Button, Container, Row, Col, Form, InputGroup, FormControl, Alert } from 'react-bootstrap';
import { GrGroup, GrUser } from 'react-icons/gr';
import { TransactionView } from '../Transactions/TransactionView';
import { alertActions } from '../../_actions';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import { AlertMessages } from '../Alert/Alert';


class FriendView extends React.Component {

    constructor(props) {
        super(props);
        this.state = { transactions: null,};
        
    }

    async componentDidMount() {
        await this.fetchData();
    }

    async fetchData() {
        try {
            if (this.props.friend) {
          
              const friendTxn= await axios.get(`http://localhost:3001/transaction/friend?friendId=${this.props.friend.email}&userId=${this.props.user.email}`);
              
                this.setState({
                    transactions: friendTxn.data,
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
            {this.props.friend && <Card>
                <FriendHeader data={{ friend: this.props.friend }} reload={this.forceReload.bind(this)} />
                {this.state.transactions&&<TransactionView transactions={this.state.transactions} />}
            </Card>}
        </>;
    }
}

const FriendHeader = (props) => {
  
    return (
        <Card.Header>
            <Container>
                <Row>
                    <Col sm={12}><h3><GrUser /> &nbsp; {props.data.friend.first_name}</h3></Col>
                </Row>
            </Container>
        </Card.Header >
    )
};


function mapState(state) {
    const { user } = state.authentication;
    return { user };
}

const actionCreators = {
    errorAlert: alertActions.error,
    clearAlert: alertActions.clear,
};


const connectedFriendView = connect(mapState, actionCreators)(FriendView);
export { connectedFriendView as FriendView };
