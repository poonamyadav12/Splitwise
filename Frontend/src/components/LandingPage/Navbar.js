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
                    <nav className="navbar navbar-inverse">
                        <div className="container-fluid">
                            <div className="navbar-header">
                                <a href="#" className="navbar-brand">Splitwise App</a>
                            </div>
                            <ul className="nav navbar-nav">

                            </ul>
                            {!this.props.user && <ul className="nav navbar-nav navbar-right">
                                <li><Link to="/signup" ><span className="glyphicon glyphicon-user"></span>Sign me Up</Link></li>
                            </ul>}
                            <ul className="nav navbar-nav navbar-right">
                                {this.props.user ? <li><Link to="/login" onClick={this.handleLogout}><span className="glyphicon glyphicon-user"></span>Logout</Link></li> :
                                    <li><Link to="/login"><span className="glyphicon glyphicon-log-in"></span> Login</Link></li>}
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