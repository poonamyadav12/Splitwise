import React, { Component } from 'react';
import '../../App.css';
import { ListGroup, Card, Accordion, Button, Container, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';

export class TransactionView extends Component {
    componentDidMount() {

    }

    render() {
        const uiTxns = this.props.transactions.map((txn) => convertToUiTransactionView(txn));
        console.log("UI Txns " + uiTxns);
        if(uiTxns.length===0) return "No Transaction to show";
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
                    <Col sm={4}>
                        {props.transaction.description}
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
                <div style={payerName === 'you' ? { color: 'green' } : { color: 'red' }}>{this.props.transaction.amount}</div>
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
                <div style={payerName === 'you' ? { color: 'green' } : { color: 'red' }}>{this.props.transaction.lentAmount}</div>
            </>
        );
    }
}

const TransactionCardHeader = (props) => (
    <>
        <div>
            {props.transaction.description}
        </div>
        <div>
            {props.transaction.amount}
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
    const owesList = props.transaction.to.map(payee => {
        return (
            <ListGroup.Item key={payee.first_name}>{payee.first_name}&nbsp;owes &nbsp; {payee.oweAmount}</ListGroup.Item>
        );
    });
    return (
        <ListGroup>
            <ListGroup.Item key={props.transaction.from.first_name}>{props.transaction.from.first_name}&nbsp;paid {props.transaction.amount}</ListGroup.Item>
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