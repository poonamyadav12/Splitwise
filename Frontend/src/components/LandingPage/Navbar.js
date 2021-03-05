import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import cookie from 'react-cookies';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import { userActions } from '../../_actions';

//create the Navbar Component
class Navbar extends Component {
    constructor(props) {
        super(props);
        this.handleLogout = this.handleLogout.bind(this);
    }
    //handle logout to destroy the cookie
    handleLogout = () => {
        console.log("Inside handle Logout");
        this.props.logout();
    }

    render() {
        return (
            <>
                <div>
                    <nav class="navbar navbar-inverse">
                        <div class="container-fluid">
                            <div class="navbar-header">
                                <a href="#" class="navbar-brand">Splitwise App</a>
                            </div>
                            <ul class="nav navbar-nav">

                            </ul>
                            {!this.props.user && <ul class="nav navbar-nav navbar-right">
                                <li><Link to="/signup" ><span class="glyphicon glyphicon-user"></span>Sign me Up</Link></li>
                            </ul>}
                            <ul class="nav navbar-nav navbar-right">
                                {this.props.user ? <li><Link to="/login" onClick={this.handleLogout}><span class="glyphicon glyphicon-user"></span>Logout</Link></li> :
                                    <li><Link to="/login"><span class="glyphicon glyphicon-log-in"></span> Login</Link></li>}
                            </ul>
                        </div>
                    </nav>
                </div>
            </>
        )
    }
}

function mapState(state) {
    const { user } = state.authentication;
    return { user };
}

const actionCreators = {
    logout: userActions.logout
};

const connectedNavBar = connect(mapState, actionCreators)(Navbar);
export { connectedNavBar as Navbar };