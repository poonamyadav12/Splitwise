import React, { Component, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';
import { alertActions } from '../_actions';
import { AlertMessages } from './Alert/Alert';
import Create from './Create/Create';
import Delete from './Delete/Delete';
import { Home } from './Home/Home';
import { Navbar } from './LandingPage/Navbar';
import { Login } from './Login/Login';
import { Profile } from './Profile/Profile';
import { Signup } from './Signup/Signup';

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

                {alert.messages && <AlertBar type={alert.type} messages={alert.messages} />}
                <div>

                    <Switch>
                        <Route path="/login" component={Login} />
                        <Route path="/home" component={Home} />
                        <Route path="/delete" component={Delete} />
                        <Route path="/create" component={Create} />
                        <Route path="/signup" component={Signup} />
                        <Route path="/profile" component={Profile} />
                    </Switch>

                </div>
            </Container>
        );
    }
}

const AlertBar = props => {
    const [show, setShow] = useState(true);

    if (show) {
        return <AlertMessages type={props.type} messages={props.messages} />;
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
