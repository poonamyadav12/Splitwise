import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import cookie from 'react-cookies';
import { Redirect } from 'react-router';
import { FaTag } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ListGroup, Card, Accordion, Button, Container, Row, Col } from 'react-bootstrap';

const userId = "ajay.yadav@gmail.com";

export class TransactionView extends Component {

    constructor(props) {
        super(props);
        this.state = { groups: [] };
    }

    componentDidMount() {
        axios.get('http://localhost:3001/user/groups/' + this.props.userId)
            .then((response) => {
                //update the state with the response data
                this.setState({
                    groups: response.data
                });
            });
    }

    render() {
        return <Card fluid>
            <Accordion>
                <ListGroup>
                    <TransactionAccordian data={{
                        description: "Food at Chat Bhavan 1", payerName: "you", paidAmount: "$1234", lentAmount: "$999",
                        payees: [
                            {
                                name: "Adam",
                                amount: "$333"
                            },
                            {
                                name: "Alice",
                                amount: "$333"
                            },
                            {
                                name: "Bob",
                                amount: "$222"
                            },
                            {
                                name: "Adam",
                                amount: "$111"
                            },
                        ]
                    }} eventKey="0" />
                </ListGroup>
                <ListGroup>
                    <TransactionAccordian data={{
                        description: "Food at Chat Bhavan 2", payerName: "you", paidAmount: "$1234", lentAmount: "$999",
                        payees: [
                            {
                                name: "Adam",
                                amount: "$333"
                            },
                            {
                                name: "Alice",
                                amount: "$333"
                            },
                            {
                                name: "Bob",
                                amount: "$222"
                            },
                            {
                                name: "Adam",
                                amount: "$111"
                            },
                        ]
                    }} eventKey="1" />
                </ListGroup>
                <ListGroup>
                    <TransactionAccordian data={{
                        description: "Food at Chat Bhavan 3", payerName: "you", paidAmount: "$1234", lentAmount: "$999",
                        payees: [
                            {
                                name: "Adam",
                                amount: "$333"
                            },
                            {
                                name: "Alice",
                                amount: "$333"
                            },
                            {
                                name: "Bob",
                                amount: "$222"
                            },
                            {
                                name: "Adam",
                                amount: "$111"
                            },
                        ]
                    }} eventKey="2" />
                </ListGroup>
                <ListGroup>
                    <TransactionAccordian data={{
                        description: "Food at Chat Bhavan 4", payerName: "you", paidAmount: "$1234", lentAmount: "$999",
                        payees: [
                            {
                                name: "Adam",
                                amount: "$333"
                            },
                            {
                                name: "Alice",
                                amount: "$333"
                            },
                            {
                                name: "Bob",
                                amount: "$222"
                            },
                            {
                                name: "Adam",
                                amount: "$111"
                            },
                        ]
                    }} eventKey="3" />
                </ListGroup>
                <ListGroup>
                    <TransactionAccordian data={{
                        description: "Food at Chat Bhavan 5", payerName: "you", paidAmount: "$1234", lentAmount: "$999",
                        payees: [
                            {
                                name: "Adam",
                                amount: "$333"
                            },
                            {
                                name: "Alice",
                                amount: "$333"
                            },
                            {
                                name: "Bob",
                                amount: "$222"
                            },
                            {
                                name: "Adam",
                                amount: "$111"
                            },
                        ]
                    }} eventKey="5" />
                </ListGroup>
                <ListGroup>
                    <TransactionAccordian data={{
                        description: "Food at Chat Bhavan 6", payerName: "you", paidAmount: "$1234", lentAmount: "$999",
                        payees: [
                            {
                                name: "Adam",
                                amount: "$333"
                            },
                            {
                                name: "Alice",
                                amount: "$333"
                            },
                            {
                                name: "Bob",
                                amount: "$222"
                            },
                            {
                                name: "Adam",
                                amount: "$111"
                            },
                        ]
                    }} eventKey="6" />
                </ListGroup>
                <ListGroup>
                    <TransactionAccordian data={{
                        description: "Food at Chat Bhavan 7", payerName: "Adam", paidAmount: "$5343", lentAmount: "$4322",
                        payees: [
                            {
                                name: "you",
                                amount: "$2323"
                            },
                            {
                                name: "Alice",
                                amount: "$2323"
                            },
                            {
                                name: "Bob",
                                amount: "$122"
                            },
                            {
                                name: "Adam",
                                amount: "$1223"
                            },
                        ]
                    }} eventKey="7" />
                </ListGroup>
            </Accordion>
        </Card>;
    }
}

const TransactionAccordian = (props) => {
    return (
        <Card>
            <TransactionHeader data={props.data} eventKey={props.eventKey} />
            <Accordion.Collapse eventKey={props.eventKey}>
                <Card.Body>
                    <TransactionCardDetail data={props.data} />
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}


const TransactionHeader = (props) => (
    <Card.Header>
        <Accordion.Toggle as={Button} variant="link" eventKey={props.eventKey} >
            <Container>
                <Row>
                    <Col sm={4}>
                        {props.data.description}
                    </Col>
                    <Col sm={4}><PayerTransactionBanner data={props.data} /></Col>
                    <Col sm={4}><LentTransactionBanner data={props.data} /></Col>
                </Row>
            </Container>
        </Accordion.Toggle>
    </Card.Header>
);

const PayerTransactionBanner = (props) => (
    <>
        <div>{props.data.payerName}&nbsp;paid</div>
        <div style={props.data.payerName === 'you' ? { color: 'green' } : { color: 'red' }}>{props.data.paidAmount}</div>
    </>
);

const LentTransactionBanner = (props) => (
    <>
        <div>{props.data.payerName}&nbsp;lent</div>
        <div style={props.data.payerName === 'you' ? { color: 'green' } : { color: 'red' }}>{props.data.lentAmount}</div>
    </>
);

const TransactionCardHeader = (props) => (
    <>
        <div>
            {props.data.description}
        </div>
        <div>
            {props.data.amount}
        </div>
        <hr
            style={{
                color: 'grey',
                backgroundColor: 'grey',
            }}
        />
    </>

);

const TransactionCardDetail = (props) => {
    const owesList = props.data.payees.map(payee => {
        return (
            <ListGroup.Item>{payee.name}&nbsp;owes &nbsp; {payee.amount}</ListGroup.Item>
        );
    });


    return (
        <ListGroup>
            <ListGroup.Item>{props.data.payerName}&nbsp;paid {props.data.paidAmount}</ListGroup.Item>
            {owesList}
        </ListGroup>
    );
}