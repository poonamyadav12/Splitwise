import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import cookie from 'react-cookies';
import { Redirect } from 'react-router';
import { userActions } from '../../_actions';
import { connect } from 'react-redux';
import { ListGroup, Row, Container, Col, Card, Form, Button } from 'react-bootstrap';

//Define a Login Component
class Signup extends Component {
    //call the constructor method
    constructor(props) {
        //Call the constrictor of Super class i.e The Component
        super(props);
        //maintain the state required for this component
        this.state = {
            name: "",
            username: "",
            password: "",
            errorMsg: ""
        }

        //Bind the handlers to this class
        this.nameChangeHandler = this.nameChangeHandler.bind(this);
        this.usernameChangeHandler = this.usernameChangeHandler.bind(this);
        this.passwordChangeHandler = this.passwordChangeHandler.bind(this);
        this.submitSignup = this.submitSignup.bind(this);
    }
    //Call the Will Mount to set the auth Flag to false
    componentWillMount() {
        this.setState({
            authFlag: false
        })
    }
    //name change handler to update state variable with the text entered by the user
    nameChangeHandler = (e) => {
        this.setState({
            name: e.target.value
        })
    }
    //username change handler to update state variable with the text entered by the user
    usernameChangeHandler = (e) => {
        this.setState({
            username: e.target.value
        })
    }
    //password change handler to update state variable with the text entered by the user
    passwordChangeHandler = (e) => {
        this.setState({
            password: e.target.value
        })
    }
    setHasError = (errorMsg) => {
        this.setState({
            errorMsg: errorMsg
        })
    }
    //submit Login handler to send a request to the node backend
    submitSignup = (e) => {
        //var headers = new Headers();
        //prevent page from refresh
        e.preventDefault();
        const data = {
            user: {
                first_name: this.state.name,
                email: this.state.username,
                default_currency: "USD",
                password: this.state.password
            }
        }

        this.props.register(data);
    }
    buildErrorComponent = () => {
        return this.state.errorMsg && <div class="alert alert-danger" role="alert">{this.state.errorMsg}</div>
    }
    render() {
        //redirect based on successful login
        return (
            <>
                {console.log('Signup user ' + this.props.user)}
                {this.props.user && <Redirect to="/home" />}
                <Container>
                    <Row style={{ alignItems: 'center' }}>
                        <Col lg={4}>
                            <img style={{ width: '17rem' }} src="https://assets.splitwise.com/assets/core/logo-square-65a6124237868b1d2ce2f5db2ab0b7c777e2348b797626816400534116ae22d7.svg" alt="Logo" />
                        </Col>

                        <Col lg={8}>
                            <Card style={{ width: '35rem' }}>
                                <Form>
                                    {this.buildErrorComponent()}
                                    <Form.Group controlId="formBasicName">
                                        <Form.Label>First name</Form.Label>
                                        <Form.Control type="text" placeholder="Enter first name" onChange={this.nameChangeHandler} />
                                    </Form.Group>
                                    <Form.Group controlId="formBasicLastName">
                                        <Form.Label>Last name</Form.Label>
                                        <Form.Control type="text" placeholder="Enter last name" />
                                    </Form.Group>
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Label>Email address</Form.Label>
                                        <Form.Control type="email" placeholder="Enter email" onChange={this.usernameChangeHandler} />
                                    </Form.Group>
                                    <Form.Group controlId="formBasicPassword">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type="password" placeholder="Password" onChange={this.passwordChangeHandler} />
                                    </Form.Group>
                                    <Button variant="success" type="submit" onClick={this.submitSignup}>
                                        Submit
                                </Button>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </>
        )
    }
}

function mapState(state) {
    const { user } = state.authentication;
    const { registering } = state.registration;
    return { registering, user };
}

const actionCreators = {
    register: userActions.register
}

const connectedRegisterPage = connect(mapState, actionCreators)(Signup);
export { connectedRegisterPage as Signup };
//export Login Component