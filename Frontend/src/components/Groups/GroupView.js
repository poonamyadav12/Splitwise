import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';
import cookie from 'react-cookies';
import { ListGroup, Card, ButtonGroup, Button, Container, Row, Col } from 'react-bootstrap';
import { GrGroup } from 'react-icons/gr';
import { TransactionView } from '../Transactions/TransactionView';


export class GroupView extends React.Component {
    render() {
        return <Card>
            <GroupHeader data={{ groupName: "Group 1" }} />
            <TransactionView />
        </Card>;
    }
}

const GroupHeader = (props) => (
    <Card.Header>
        <Container>
            <Row>
                <Col sm={10}><GrGroup /> &nbsp; {props.data.groupName}</Col>
                <Col sm={2}><Button>ADD EXPENSE</Button></Col>
            </Row>
        </Container>
    </Card.Header >
);