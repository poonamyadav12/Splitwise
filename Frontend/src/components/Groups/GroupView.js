import React, { Component, useState } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';
import cookie from 'react-cookies';
import { ListGroup, Card, ButtonGroup, Button, Container, Row, Col, Form, InputGroup, FormControl } from 'react-bootstrap';
import { GrGroup } from 'react-icons/gr';
import { TransactionView } from '../Transactions/TransactionView';
import { alertActions } from '../../_actions';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';


class GroupView extends React.Component {

    constructor(props) {
        super(props);
        this.state = { group: null, transactions: [], isAddExpenseOpen: false };
    }


    async componentDidMount() {
        try {
            if (this.props.groupId) {
                const [groupRes, txnRes] = await Promise.all([
                    axios.get('http://localhost:3001/group/get?groupId=' + this.props.groupId),
                    axios.get('http://localhost:3001/group/transactions?groupId=' + this.props.groupId),
                ]);
                console.log("Response " + JSON.stringify(groupRes));
                console.log("Response 2 " + JSON.stringify(txnRes));
                this.setState({
                    group: groupRes.data,
                    transactions: txnRes.data,
                });
            }
        } catch (err) {
            console.log("Error in Group View " + err);
            this.props.errorAlert(["Something went wrong. Please try again"]);
        }
    }
    render() {
        return <>
            {this.state.group && <Card>
                <GroupHeader data={{ group: this.state.group }} />
                <TransactionView transactions={this.state.transactions} />
            </Card>}
        </>;
    }
}


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
                    <Col sm={10}><GrGroup /> &nbsp; {props.data.group.name}</Col>
                    <Col sm={2}> <Container><Button onClick={openAddExpenseForm}>ADD EXPENSE</Button>
                        {isAddExpenseOpen ? <AddExpenseModal group={props.data.group} closeModal={closeAddExpenseForm} isOpen={isAddExpenseOpen} /> : null}
                    </Container></Col>

                </Row>
            </Container>
        </Card.Header >
    )
};

class AddExpenseModal extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedMembers: new Map()
        };
    }

    toggleMember(memberEmail) {
        this.setState((prevState) => {
            selectedMembers: prevState.selectedMembers.set(memberEmail, !prevState.selectedMembers.get(memberEmail))
        });
    }

    render() {
        return (
            <>

                <Modal
                    show={this.props.isOpen}
                    onHide={this.props.closeModal}
                    keyboard={false}
                    className="add-expense-modal"
                    animation={false}
                // style={{ opacity: "1"}}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Add Expense</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.props.group.members.map((member) => (
                            <InputGroup className="mb-3" key={member.email}>

                                <InputGroup.Checkbox onChange={this.toggleMember.bind(this, member.email)} aria-label="Checkbox for following text input" />

                                &nbsp;<Form.Label>{`${member.first_name}${member.last_name ? " " + member.last_name : ""}`}</Form.Label>
                            </InputGroup>
                        ))}
                        <Form.Group controlId="formBasicName">
                            <Form.Label>Description</Form.Label>
                            <Form.Control type="text" placeholder="Enter first name" onChange={this.nameChangeHandler} />
                        </Form.Group>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.props.closeModal}>
                            Close
            </Button>
                        <Button variant="primary">Understood</Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

function mapState(state) {
    return { state };
}

const actionCreators = {
    errorAlert: alertActions.error,
    clearAlert: alertActions.clear,
};


const connectedGroupView = connect(mapState, actionCreators)(GroupView);
export { connectedGroupView as GroupView };