import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import cookie from 'react-cookies';
import { GroupList } from '../Groups/GroupList';
import { TransactionView } from '../Transactions/TransactionView.js'
import { GroupView } from '../Groups/GroupView.js'
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import { IoMdAdd } from 'react-icons/io';
import { ListGroup, Row, Container, Col, Card } from 'react-bootstrap';
import { connect } from 'react-redux';
import { FriendList } from '../Friends/FriendList';

class Home extends Component {
    constructor() {
        super();
        this.state = {
            redirect: false,
            groupId: null,
        }

        //this.addNewGroup = this.addNewGroup.bind(this);
    }

    render() {
        return (
            <>
                {console.log("Hdrehsdfhjuewdf " + this.props.user)}
                {!this.props.user && <Redirect to="/login" />}
                <Container fluid>
                    <Row>
                        <Col lg={2}>
                            <Card style={{ width: '18rem' }}>
                                <ListGroup>
                                    <ListGroup.Item><Link to={"/home" + this.props.userId}>DashBoard</Link></ListGroup.Item>
                                    <ListGroup.Item><Link to={"/home" + this.props.userId}>Recent Activity</Link></ListGroup.Item>

                                </ListGroup>
                                <ListGroup>
                                    <ListGroup.Item><LinkWithText text='Groups' onClick={Object.assign(this.state, { groupId: "23" })} label='+ add' link="#" /></ListGroup.Item>
                                    <ListGroup.Item><GroupList userId="ajay.yadav@gmail.com" /></ListGroup.Item>
                                </ListGroup>

                                <ListGroup>
                                    <ListGroup.Item><LinkWithText text='Friends' onClick={Object.assign(this.state, { groupId: "23" })} label='+ add' link="#" /></ListGroup.Item>
                                    <ListGroup.Item><FriendList userId="ajay.yadav@gmail.com" /></ListGroup.Item>
                                </ListGroup>
                            </Card>
                        </Col>
                        <Col lg={8}>
                            <GroupView />
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
            </>
        )
    }
}

const LinkWithText = (props) => <Container><Row><Col sm={1} >{props.text}&nbsp; </Col><Col sm={1}><Link to={props.link}><IoMdAdd /></Link></Col></Row></Container>

function mapState(state) {
    const { user } = state.authentication;
    return { user };
}

const connectedHome = connect(mapState, {})(Home);
export { connectedHome as Home };