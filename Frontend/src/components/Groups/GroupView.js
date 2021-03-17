import axios from 'axios';
import React, { useState } from 'react';
import { Button, Card, Col, Container, Form, InputGroup, ListGroup, Modal, Row } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import { GrEdit } from 'react-icons/gr';
import { connect } from 'react-redux';
import { alertActions } from '../../_actions';
import { calculateDebtForAGroup } from '../../_helper/debtcalculator';
import { getRoundedAmount } from '../../_helper/money';
import { AlertMessages } from '../Alert/Alert';
import { GroupAvatar, LocalizedAmount, UserAvatar } from '../Shared/Shared';
import { TransactionView } from '../Transactions/TransactionView';
import { GroupCreateOrUpdateModal } from './GroupCreateOrUpdateModel';


class GroupView extends React.Component {

    constructor(props) {
        super(props);
        this.state = { groupId: this.props.groupId, group: null, transactions: [], isAddExpenseOpen: false, isGroupUpdateOpen: false, };
    }

    async componentDidMount() {
        await this.fetchData();
    }

    async fetchData() {
        try {
            if (this.props.groupId) {
                const [groupRes, txnRes] = await Promise.all([
                    axios.get('http://localhost:3001/group/get?groupId=' + this.props.groupId),
                    axios.get('http://localhost:3001/group/transactions?groupId=' + this.props.groupId),
                ]);
                this.setState({
                    group: groupRes.data,
                    transactions: txnRes.data,
                });

            }
        } catch (err) {
            this.props.errorAlert(["Something went wrong. Please try again"]);
        }
    }

    async leaveGroup() {
        const data = {
            groupId: this.state.group.id,
            userId: this.props.user.email,
        };
        try {
            const response = await axios.post('http://localhost:3001/group/leave', data);

            this.props.reloadHomeView();
            this.props.setDashboardView();
        } catch (error) {
            const data = error.response.data;
            const msg = Array.isArray(data) ? data.map(d => d.message) : ["Some error occured, please try again."];
            this.props.errorAlert(msg);
        }
    }

    forceReload() {
        this.fetchData();
    }

    render() {
        let balances = null;
        let canLeave = false;
        if (this.state.group) {
            balances = calculateDebtForAGroup(this.state.group, this.state.transactions);
            const usersBalance = balances.filter((balance) => balance.user.email === this.props.user.email)[0];
            balances = balances.filter((balance) => balance.user.email !== this.props.user.email);
            canLeave = getRoundedAmount(usersBalance.totalAmount) === 0;
        }
        return <>
            <Container fluid={true}>
                <Row>
                    <Col sm={8}>
                        {this.state.group && <Card>
                            <GroupHeader data={{ group: this.state.group }} canLeave={canLeave} leaveGroup={this.leaveGroup.bind(this)} reloadHomeView={this.props.reloadHomeView} reloadGroupView={this.forceReload.bind(this)} />
                            <TransactionView transactions={this.state.transactions} />
                        </Card>}
                    </Col>
                    <Col sm={2}>
                        {balances && balances.length > 0 && balances.map((balance) => <UserBalanceView data={balance} />)}
                    </Col>
                </Row>
            </Container>
        </>;
    }
}

const UserBalanceView = (props) => {
    const color = props.data.totalAmount === 0 ? 'orange' : (props.data.totalAmount > 0 ? 'green' : 'red');
    const suffix = props.data.totalAmount === 0 ? "settled up" :
        (props.data.totalAmount > 0 ? ' gets back ' : ' owes ');
    return (
        <ListGroup.Item key={props.data.user.email}>
            <UserAvatar user={props.data.user} />
            <div style={{ marginLeft: '3rem', marginTop: '-1rem' }} className='h5'>
                <span style={{ color }}>
                    {suffix}
                    {props.data.totalAmount !== 0 && (
                        <LocalizedAmount
                            amount={props.data.totalAmount}
                            currency={props.data.user.default_currency}
                        />
                    )}
                </span>
            </div>
        </ListGroup.Item>
    );
}

const GroupHeader = (props) => {
    const [isAddExpenseOpen, setAddExpenseFormOpen] = useState(false);
    const [isGroupUpdateOpen, setGroupUpdateOpen] = useState(false);

    function openAddExpenseForm() {
        setAddExpenseFormOpen(true);
    }
    function closeAddExpenseForm() {
        setAddExpenseFormOpen(false);
    }
    function openUpdateGroupForm() {
        setGroupUpdateOpen(true);
    }
    function closeUpdateGroupForm() {
        setGroupUpdateOpen(false);
    }
    return (
        <Card.Header>
            <Container>
                <Row>
                    <Col sm={9}><div style={{ display: 'flex', alignItems: 'baseline' }}><h3><GroupAvatar group={props.data.group} /> &nbsp; {props.data.group.name}</h3> &nbsp; <GrEdit onClick={openUpdateGroupForm} />
                        {isGroupUpdateOpen ? <GroupCreateOrUpdateModal group={props.data.group} reloadHomeView={() => { props.reloadHomeView(); props.reloadGroupView(); }} closeModal={closeUpdateGroupForm} isOpen={isGroupUpdateOpen} /> : null}</div></Col>
                    <Col sm={3}> <div style={{ display: 'flex', alignItems: 'baseline' }}><Button onClick={openAddExpenseForm}>ADD EXPENSE</Button>
                        {isAddExpenseOpen ? <ConnectedAddExpenseModal reloadGroupView={props.reloadGroupView} group={props.data.group} closeModal={closeAddExpenseForm} isOpen={isAddExpenseOpen} /> : null}
                        {props.canLeave && <Button style={{ marginLeft: '2rem' }} variant="danger" onClick={props.leaveGroup}>LEAVE GROUP</Button>}
                    </div></Col>
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
                "currency_code": props.user.default_currency,
                "group_id": props.group.id,
                "description": description,
            },
        };

        try {
            const response = await axios.post('http://localhost:3001/transaction/create', data);
            props.reloadGroupView();
            props.closeModal();

        } catch (error) {
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
                backdrop="static"
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
                                        <Form.Control type="text" style={{ fontSize: '24px', width: '29.5rem' }} placeholder="Description" onChange={handleDescChange} />
                                    </Form.Group>
                                </Row>
                                <Row>
                                    <CurrencyInput prefix="$" value={amount} onChange={handleAmountChange} style={{ fontSize: '32px', width: '29.5rem', border: '1px solid #ccc', 'border-radius': '4px', color: '#5555555' }} />
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


const connectedGroupView = connect(mapState, actionCreators)(GroupView);
const ConnectedAddExpenseModal = connect(mapState, actionCreators)(AddExpenseModal)
export { connectedGroupView as GroupView };
