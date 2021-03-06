import React, { Component, useState } from 'react';
import { Route, Switch, withRouter, useLocation } from 'react-router-dom';
import { Login } from './Login/Login';
import { Home } from './Home/Home';
import Delete from './Delete/Delete';
import Create from './Create/Create';
import { Navbar } from './LandingPage/Navbar';
import Groups from './Groups/AddGroup';
import { Signup } from './Signup/Signup';
import { connect } from 'react-redux';
import { alertActions } from '../_actions';
import { Alert, Button, Container } from 'react-bootstrap';

//Create a Main Component
class Main extends Component {

    componentDidUpdate(prevProps) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            this.props.clearAlerts();
        }
    }

    render() {
        const { alert } = this.props;
        return (

            <Container fluid>
                <Navbar />

                {alert.messages && <AlertBar messages={alert.messages} />}
                <div>

                    <Switch>
                        <Route path="/login" component={Login} />
                        <Route path="/home" component={Home} />
                        <Route path="/delete" component={Delete} />
                        <Route path="/create" component={Create} />
                        <Route path="/signup" component={Signup} />
                        <Route path="/addGroup" component={Groups} />
                    </Switch>

                </div>
            </Container>
        );
    }
}

const AlertBar = props => {
    const [show, setShow] = useState(true);

    if (show) {
        return (
            <Alert color='primary' variant="danger" onClose={() => setShow(false)} dismissible style={{ opacity: "unset" }}>
                <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
                {props.messages.map(message => <p key="{message}">
                    {message}
                </p>)}
            </Alert>
        );
    }
    return <Button variant="danger" onClick={() => setShow(true)}>Show Alert</Button>;
}

function mapState(state) {
    const { alert } = state;
    return { alert };
}

const actionCreators = {
    clearAlerts: alertActions.clear
};

const connectedApp = withRouter(connect(mapState, actionCreators)(Main));
export { connectedApp as Main };