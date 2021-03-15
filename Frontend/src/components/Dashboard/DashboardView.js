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
import { calculateDebt, calculateDebtPerFriend } from '../../_helper/debtcalculator';
import { LocalizedAmount, UserAvatar, UserBalanceAvatar } from '../Shared/Shared';
var _ = require('lodash');


class DashboardView extends React.Component {

  constructor(props) {
    super(props);
    this.state = { transactions: null, };
  }

  async componentDidMount() {
    await this.fetchData();
  }

  async fetchData() {
    try {
      if (this.props.user) {
        const transactions = await axios.get(`http://localhost:3001/user/transactions?userId=${this.props.user.email}`);
        this.setState({
          transactions: transactions.data,
        });
      }
    } catch (err) {
      console.log("Error in DashBoard View " + err);
      this.props.errorAlert(["Something went wrong. Please try again"]);
    }
  }

  forceReload() {
    this.fetchData();
  }

  render() {
    if (!this.state.transactions) return null;
    if (this.state.transactions.length === 0) return <h5>No transactions yet. Start adding expenses to see the balances.</h5>;
    const calculatedDebt = calculateDebt(this.props.user.email, this.state.transactions);
    const debtPerFriend = calculateDebtPerFriend(this.props.user.email, this.state.transactions);
    return <>
      <Card>
        <Container>
          <Row>
            <Col sm={4}>
              <div><h5>Total balance </h5></div>
              <div>
                <h4 style={{ color: calculatedDebt.totalAmount >= 0 ? 'green' : 'red' }}>
                  <LocalizedAmount amount={calculatedDebt.totalAmount} currency={this.props.user.default_currency} />
                </h4>
              </div>
            </Col>
            <Col sm={4}>
              <div><h5>You owe </h5></div>
              <div>
                <h4 style={{ color: 'red' }}>
                  <LocalizedAmount amount={calculatedDebt.oweAmount} currency={this.props.user.default_currency} />
                </h4>
              </div>
            </Col>
            <Col sm={4}>
              <div><h5>You are owed </h5></div>
              <div>
                <h4 style={{ color: 'green' }}>
                  <LocalizedAmount amount={calculatedDebt.paidAmount} currency={this.props.user.default_currency} />
                </h4>
              </div>
            </Col>
          </Row>
        </Container>
        <Container>
          <Row style={{ height: "80vh" }}>
            <Col sm={4} style={{ height: "85vh", borderRight: "1px solid grey" }}>
              <h3>YOU OWE</h3>
              <ListGroup>
                {debtPerFriend.negative.length > 0 ? debtPerFriend.negative.map((friendBalance) => <BalanceView data={friendBalance} user={this.props.user} />) : null}
              </ListGroup></Col>
            <Col sm={4}>
              <h3>YOU ARE OWED</h3>
              <ListGroup>
                {debtPerFriend.positive.length > 0 ? debtPerFriend.positive.map((friendBalance) => <BalanceView data={friendBalance} user={this.props.user} />) : null}
              </ListGroup></Col>
          </Row>
        </Container>
      </Card>
    </>;
  }
}

const BalanceView = (props) => {
  const color = props.data.balance > 0 ? 'green' : 'red';
  return (<ListGroup.Item>
    <UserBalanceAvatar user={props.data.friend} />{`${props.data.friend.first_name} ${(props.data.balance > 0 ? 'owes you' : 'you owe')} `}<span style={{ color }}><LocalizedAmount amount={props.data.balance} currency={props.user.default_currency} /></span>
  </ListGroup.Item >);
};

const GroupHeader = (props) => {
  const [isAddExpenseOpen, setAddExpenseFormOpen] = useState(false);

  function openAddExpenseForm() {
    setAddExpenseFormOpen(true);
  }
  function closeAddExpenseForm() {
    setAddExpenseFormOpen(false);
  }
  return (
    <Card.Header>
      <Container>
        <Row>
          <Col sm={10}><h3><GrGroup /> &nbsp; {props.data.group.name}</h3></Col>
          <Col sm={2}> <Container><Button onClick={openAddExpenseForm}>ADD EXPENSE</Button>
            {isAddExpenseOpen ? <ConnectedAddExpenseModal reloadGroupView={props.reload} group={props.data.group} closeModal={closeAddExpenseForm} isOpen={isAddExpenseOpen} /> : null}
          </Container></Col>
        </Row>
      </Container>
    </Card.Header >
  )
};

function AddExpenseModal(props) {

  const payees = props.group.members.filter((member) => member.email !== props.user.email);
  const [selectedMembers, setSelectedMembers] = useState(new Map(
    payees.map((member) => [member.email, true]))
  );

  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");

  const [errorMsg, setErrorMsg] = useState([]);

  function toggleMember(memberEmail) {
    selectedMembers.set(memberEmail, !selectedMembers.get(memberEmail));
    setSelectedMembers(selectedMembers);
  }

  function handleAmountChange(event, maskedvalue, floatvalue) {
    setAmount(maskedvalue);
  }

  function handleDescChange(e) {
    e.preventDefault();
    setDescription(e.target.value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = {
      "transaction": {
        "from": props.user.email,
        "to": Array.from(selectedMembers).filter(([member, checked]) => checked).map(([member, checked]) => member),
        "amount": Number(amount),
        "currency_code": props.user.default_currency_code,
        "group_id": props.group.id,
        "description": description,
      },
    };

    console.log("transaction request " + JSON.stringify(data));
    try {
      const response = await axios.post('http://localhost:3001/transaction/create', data);
      console.log("transactin response " + JSON.stringify(response));
      props.reloadGroupView();
      props.closeModal();

    } catch (error) {
      console.log("Error " + JSON.stringify(error));
      const data = error.response.data;
      const msg = Array.isArray(data) ? data.map(d => d.message) : ["Some error occured, please try again."];
      setErrorMsg(msg);
    }
  }

  return (
    <>

      <Modal
        show={props.isOpen}
        onHide={props.closeModal}
        keyboard={false}
        className="add-expense-modal"
        animation={false}
        style={{ width: "100vw" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add an expense</Modal.Title>
          <AlertMessages messages={errorMsg} />
        </Modal.Header>
        <Modal.Body>
          <Card.Title>With you and</Card.Title>
          <ListGroup>
            {payees.map((member) => (
              <ListGroup.Item>
                <InputGroup className="mb-3" key={member.email}>
                  <InputGroup.Checkbox defaultChecked={true} onChange={toggleMember.bind(null, member.email)} aria-label="Checkbox for following text input" />

                                &nbsp;<Form.Label>{`${member.first_name}${member.last_name ? " " + member.last_name : ""}`}</Form.Label>
                </InputGroup>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Container>
            <Row>
              <Col sm={2}>
                <img src="https://s3.amazonaws.com/splitwise/uploads/category/icon/square_v2/uncategorized/general@2x.png" alt="transaction" />
              </Col>
              <Col sm={3}>
                <Row>
                  <Form.Group controlId="formDescription">
                    <Form.Control type="text" style={{ 'font-size': '24px', width: '29.5rem' }} placeholder="Description" onChange={handleDescChange} />
                  </Form.Group>
                </Row>
                <Row>
                  <CurrencyInput prefix="$" value={amount} onChange={handleAmountChange} style={{ 'font-size': '32px', width: '29.5rem', border: '1px solid #ccc', 'border-radius': '4px', color: '#5555555' }} />
                </Row>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.closeModal}>
            Cancel
            </Button>
          <Button variant="primary" onClick={handleSubmit}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

function mapState(state) {
  const { user } = state.authentication;
  return { user };
}

const actionCreators = {
  errorAlert: alertActions.error,
  clearAlert: alertActions.clear,
};


const connectedDashboardView = connect(mapState, actionCreators)(DashboardView);
const ConnectedAddExpenseModal = connect(mapState, actionCreators)(AddExpenseModal)
export { connectedDashboardView as DashboardView };
