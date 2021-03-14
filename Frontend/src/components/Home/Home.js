import React, { Component, useEffect, useState } from 'react';
import '../../App.css';
import axios from 'axios';
import cookie from 'react-cookies';
import { GroupList } from '../Groups/GroupList';
import { TransactionView } from '../Transactions/TransactionView.js'
import { GroupView } from '../Groups/GroupView.js'
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import { IoMdAdd } from 'react-icons/io';
import { MdRemoveCircleOutline } from 'react-icons/md';
import { ListGroup, Row, Container, Col, Card, Modal, InputGroup, Form, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { FriendList } from '../Friends/FriendList';
import { alertActions } from '../../_actions';
import { AlertMessages } from '../Alert/Alert';
import CurrencyInput from 'react-currency-input';
import { UserTypeHead } from '../User/UserTypeHead';
import { FriendView } from '../Friends/FriendView';
import { ActivityView } from '../Activity/ActivityView';
import { UploadImage } from '../Image/UploadImage';
import { DashboardView } from '../Dashboard/DashboardView';

class Home extends Component {
    constructor() {
        super();
        this.state = {
            redirect: false,
            groupId: null,
            viewComponent: ViewComponent.DASHBOARD,
            groupViewData: null,
            groups: [],
            isGroupCreateOpen: false,
            friends: [],
        }
        this.setGroupView = setGroupView.bind(this);
        this.setFriendView = setFriendView.bind(this);
        this.setActivityView = setActivityView.bind(this);
        this.setDashboardView = setDashboardView.bind(this);
        //this.addNewGroup = this.addNewGroup.bind(this);
    }

    componentWillMount() {
        this.props.clearAlert(); 
    }
    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        axios.get('http://localhost:3001/user/groups?userId=' + this.props.user.email)
            .then((response) => {
                //update the state with the response data
                this.setState({
                    groups: response.data
                });
                let friendsMap = new Map();
                response.data.flatMap(group => group.members).filter((member) => member.email !== this.props.user.email).forEach((member) => (friendsMap.set(member.email, member)));
                this.setState({
                    friends: Array.from(friendsMap.values()),
                });
            });
    }
    reload() {
        this.fetchData();
    }
    openCreateGroupForm() {
        this.setState({ isGroupCreateOpen: true });
    }
    closeCreateGroupForm() {
        this.setState({ isGroupCreateOpen: false });
    }
    render() {
        return (
            <>
                {console.log("Hdrehsdfhjuewdf " + this.props.user)}
                {!this.props.user ? <Redirect to="/login" /> :
                    <Container fluid>
                        <Row>
                            <Col lg={2}>
                                <Card style={{ width: '18rem' }}>
                                    <ListGroup>
                                        <ListGroup.Item><Link to={"#"}  onClick={() => this.setDashboardView(this.props.user.email)}>DashBoard</Link></ListGroup.Item>
                                        <ListGroup.Item>
                                            <Link to={"#"} onClick={() => this.setActivityView(this.props.user.email)}>Recent Activity</Link></ListGroup.Item>
                                    </ListGroup>
                                    <ListGroup>
                                        <ListGroup.Item>
                                            <Container>
                                                <LinkWithText text='Groups' onClick={() => this.openCreateGroupForm()} label='+ add' link="#" />
                                                {this.state.isGroupCreateOpen ? <ConnectedGroupCreateModal reloadHomeView={this.reload.bind(this)} closeModal={() => this.closeCreateGroupForm()} isOpen={this.state.isGroupCreateOpen} /> : null}
                                            </Container>
                                        </ListGroup.Item>
                                        <ListGroup.Item><GroupList groups={this.state.groups} setGroupView={this.setGroupView} /></ListGroup.Item>
                                    </ListGroup>
                                    <ListGroup>
                                        <ListGroup.Item><LinkWithText text='Friends' onClick={Object.assign(this.state, { groupId: "23" })} label='+ add' link="#" /></ListGroup.Item>
                                        <ListGroup.Item><FriendList friends={this.state.friends} setFriendView={this.setFriendView} /></ListGroup.Item>
                                    </ListGroup>
                                </Card>
                            </Col>
                            <Col lg={8}>
                                {renderMiddleView(this.state,this.setGroupView)}
                                {/* <UploadImage></UploadImage> */}
                            </Col>
                            <Col lg={2}>
                                <Card style={{ width: '18rem' }}>
                                    <Card.Header>
                                        GET SPLITWISE PRO<br></br>
                                        <img style={{ width: '16rem' }} src="https://assets.splitwise.com/assets/pro/logo-337b1a7d372db4b56c075c7893d68bfc6873a65d2f77d61b27cb66b6d62c976c.svg" alt="Logo" />
                                    </Card.Header><br></br>
                                    <Card.Footer>
                                        Subscribe to Splitwise Pro for no ads, currency conversion, charts, search, and more.
                                </Card.Footer>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                }
            </>
        )
    }
}
function setDashboardView() {
    this.setState({ viewComponent: ViewComponent.DASHBOARD });
}
function setGroupView(groupId) {
    this.setState({ viewComponent: ViewComponent.GROUPVIEW, groupViewData: { groupId } });
}
function setFriendView(friend) {
    this.setState({ viewComponent: ViewComponent.FRIENDVIEW, friendViewData: { friend } });
}
function setActivityView(userId) {
    this.setState({ viewComponent: ViewComponent.RECENTACTIVITYVIEW, activityViewData: { userId } });
}
function renderMiddleView(state,setGroupView) {
    switch (state.viewComponent) {
        case ViewComponent.DASHBOARD:
            return <DashboardView/>;
        case ViewComponent.GROUPVIEW:
            const groupId = state.groupViewData.groupId;
            return <GroupView key={groupId} groupId={groupId} />;
        case ViewComponent.FRIENDVIEW:
            const friend = state.friendViewData.friend;
            return <FriendView key={friend.email} friend={friend} />;
        case ViewComponent.RECENTACTIVITYVIEW:
            const userId = state.activityViewData.userId;
            return <ActivityView key={userId} userId={userId} setGroupView={setGroupView} />;
        default:
            return '';
    }
}

const ViewComponent = Object.freeze({
    DASHBOARD: 'DASHBOARD',
    GROUPVIEW: 'GROUPVIEW',
    FRIENDVIEW: 'FRIENDVIEW',
    RECENTACTIVITYVIEW: 'RECENTACTIVITYVIEW'
});

function GroupCreateModal(props) {
    const [name, setName] = useState("");

    const [errorMsg, setErrorMsg] = useState([]);

    const [members, setMembers] = useState([]);

    function handleGroupNameChange(e) {
        e.preventDefault();
        setName(e.target.value);
    }

    function handleGroupMemberChange(members) {
        setMembers(members);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const data = {
            group: {
                creator: props.user.email,
                name,
                members: [...members, {
                    first_name: props.user.first_name,
                    email: props.user.email,
                    last_name: props.user.last_name
                }],
            }
        };

        console.log("group request " + JSON.stringify(data));
        try {
            const response = await axios.post('http://localhost:3001/group/create', data);
            console.log("group create response " + JSON.stringify(response));
            props.reloadHomeView();
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
                    <Modal.Title>START A NEW GROUP</Modal.Title>
                    <AlertMessages messages={errorMsg} />
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formGroupName">
                        <Form.Label>My group shall be called...</Form.Label>
                        <Form.Control type="text" style={{ 'font-size': '24px', width: '29.5rem' }} placeholder="1600 Pennsylvania Ave" onChange={handleGroupNameChange} />
                    </Form.Group>
                    <Card.Title>GROUP MEMBERS</Card.Title>
                    <GroupMemberList onChange={(members) => handleGroupMemberChange(members)} />
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

const GroupMemberList = (props) => {
    const [members, setMembers] = useState([]);
    function handleEmailChange(index, e) {
        const newMembers = members.map((member, i) => {
            if (i === index) {
                return { ...member, email: e.target.value };
            }
            return member;
        });
        setMembers(newMembers);
        props.onChange(newMembers);

    }
    function handleNameChange(index, value) {
        const newMembers = members.map((member, i) => {
            if (i === index) {
                return { ...member, first_name: value[0].first_name, last_name: value[0].last_name, email: value[0].email };
            }

            return member;
        });
        setMembers(newMembers);
        props.onChange(newMembers);
    }
    function addEmptyMember() {
        setMembers([...members, {}]);
    }
    function handleDelete(index, e) {
        setMembers(members.filter((member, i) => i !== index));
    }
    return (
        <>
            {members.map((member, index) => (
                <Container>
                    <Row>
                        <Col sm={2}>
                            <Form.Group controlId="formName">
                                <UserTypeHead skipCurrentUser={true} onChange={handleNameChange.bind(null, index)} style={{ 'font-size': '18px', width: '17.5rem' }} />
                                {/* <Form.Control type="text" style={{ 'font-size': '18px', width: '17.5rem' }}
                                    value={member.name ? member.name : null}
                                    placeholder="Name" onChange={handleNameChange.bind(null, index)} /> */}
                            </Form.Group>
                        </Col>
                        <Col sm={2}>
                            <Form.Group controlId="formEmail">
                                <Form.Control type="text" style={{ 'font-size': '18px', width: '19rem' }}
                                    value={member.email ? member.email : null}
                                    placeholder="Email" onChange={handleEmailChange.bind(null, index)} />
                            </Form.Group>
                        </Col>
                        <Col sm={1} style={{ 'text-align': 'center' }}>
                            <MdRemoveCircleOutline onClick={handleDelete.bind(null, index)} style={{ height: '27px', width: '25px', 'vertical-align': 'text-top' }} />
                        </Col>
                    </Row>
                </Container>
            ))}
            <Link onClick={() => addEmptyMember()} to="#" > +Add person</Link>
        </>
    );
};

const LinkWithText = (props) => <Container><Row><Col sm={1} >{props.text}&nbsp; </Col><Col sm={1}><Link onClick={() => props.onClick()} to={props.link}><IoMdAdd /></Link></Col></Row></Container>

function mapState(state) {
    const { user } = state.authentication;
    return { user };
}

const actionCreators = {
    errorAlert: alertActions.error,
    clearAlert: alertActions.clear,
};

const connectedHome = connect(mapState, actionCreators)(Home);
const ConnectedGroupCreateModal = connect(mapState, actionCreators)(GroupCreateModal);
export { connectedHome as Home };