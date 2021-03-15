import React, { Component } from 'react';
import '../../App.css';
import { ListGroup, Card, Accordion, Button, Container, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { LocalizedAmount, UserAvatar } from '../Shared/Shared';
import { convertAmount } from '../../_helper/money';
var dateFormat = require("dateformat");

export class TransactionView extends Component {
    componentDidMount() {

    }

    render() {
        const uiTxns = this.props.transactions.map((txn) => convertToUiTransactionView(txn));
        console.log("UI Txns " + uiTxns);
        if (uiTxns.length === 0) return "No Transaction to show";
        return <Card fluid='true'>
            <Accordion>
                {uiTxns.map((transaction) => (<ListGroup key={transaction.id}><TransactionAccordian transaction={transaction} /></ListGroup>))}
            </Accordion>
        </Card>;
    }
}

const TransactionAccordian = (props) => {
    return (
        <Card key={props.transaction.id}>
            <TransactionHeader transaction={props.transaction} eventKey={props.transaction.id} />
            <Accordion.Collapse eventKey={props.transaction.id}>
                <Card.Body>
                    <TransactionCardDetail transaction={props.transaction} />
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
                    <Col sm={1} style={{ width: "1rem" }}>
                        <Row>
                            <h5 style={{ marginRight: '5px', color: 'grey' }}>
                                <div>{dateFormat(props.transaction.createdAt, "mmm").toUpperCase()}</div>{' '}
                                <div>{dateFormat(props.transaction.createdAt, "d")}</div>
                            </h5>
                        </Row>
                    </Col>
                    <Col sm={3}>
                        <Row>
                            <div className="h5">{props.transaction.description}</div>
                        </Row>
                    </Col>
                    <Col sm={4}><ConnectedPayerTransactionBanner transaction={props.transaction} /></Col>
                    <Col sm={4}><ConnectedLentTransactionBanner transaction={props.transaction} /></Col>
                </Row>
            </Container>
        </Accordion.Toggle>
    </Card.Header>
);

class PayerTransactionBanner extends React.Component {
    render() {
        const userId = this.props.user.email;
        const payerName = this.props.transaction.from.email === userId ? 'you' : this.props.transaction.from.first_name;
        return (
            <>
                <div>{payerName}&nbsp;paid</div>
                <div style={payerName === 'you' ? { color: 'green' } : { color: 'red' }}><LocalizedAmount amount={this.props.transaction.amount} currency={this.props.transaction.currency_code} /></div>
            </>
        );
    }
}

class LentTransactionBanner extends React.Component {
    render() {
        const userId = this.props.user.email;
        const payerName = this.props.transaction.from.email === userId ? 'you' : this.props.transaction.from.first_name;
        return (
            <>
                <div>{payerName}&nbsp;lent</div>
                <div style={payerName === 'you' ? { color: 'green' } : { color: 'red' }}><LocalizedAmount amount={this.props.transaction.lentAmount} currency={this.props.transaction.currency_code} /></div>
            </>
        );
    }
}

const TransactionCardDetail = (props) => {
    const owesList = props.transaction.to.map(payee => {
        return (
            <ListGroup.Item key={payee.first_name}><UserAvatar user={payee} />{' '}owes{' '}<LocalizedAmount amount={payee.oweAmount} currency={props.transaction.currency_code} /></ListGroup.Item>
        );
    });
    return (
        <ListGroup>
            <ListGroup.Item key={props.transaction.from.first_name}><UserAvatar user={props.transaction.from} />&nbsp;paid <LocalizedAmount amount={props.transaction.amount} currency={props.transaction.currency_code} /></ListGroup.Item>
            {owesList}
        </ListGroup>
    );
}

function convertToUiTransactionView(transaction) {
    const amount = transaction.amount;
    const totalpayees = transaction.to.length;

    const amountPerMember = amount / (totalpayees + 1);
    transaction.to = transaction.to.map((payee) => {
        payee.oweAmount = amountPerMember;
        return payee;
    });
    transaction.lentAmount = amount * totalpayees / (totalpayees + 1);
    return transaction;
}

function mapState(state) {
    const { user } = state.authentication;
    return { user };
}

const ConnectedLentTransactionBanner = connect(mapState, {})(LentTransactionBanner);
const ConnectedPayerTransactionBanner = connect(mapState, {})(PayerTransactionBanner);