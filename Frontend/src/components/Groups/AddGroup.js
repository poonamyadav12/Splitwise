import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';
import cookie from 'react-cookies';

class AddGroup extends Component {
    constructor(props) {
        //Call the constrictor of Super class i.e The Component
        super(props);
        this.state = {
            bookId: "",
            redirect: false,
            errorMsg: ""
        }
        this.bookIdHandler = this.bookIdHandler.bind(this);
        this.submitDelete = this.submitDelete.bind(this);
    }
    bookIdHandler = (e) => {
        this.setState({
            bookId: e.target.value
        })
    }
    setHasError = (errorMsg) => {
        this.setState({
            errorMsg: errorMsg
        })
    }
    setRedirect = () => {
        this.setState({
            redirect: true
        })
    }
    renderRedirect = () => {
        if (this.state.redirect) {
            return <Redirect to='/home' />
        }
    }
    submitDelete = (e) => {
        e.preventDefault();
        console.log("book id" + this.state.bookId);
        const data = {
            bookId: this.state.bookId
        }
        axios.post('http://localhost:3001/delete', data)
            .then(response => {
                console.log("Status Code : ", response.status);
                if (response.status === 200) {
                    this.setRedirect();
                    this.renderRedirect();
                } else {
                    const data = response.data;
                    this.setHasError(data.msg || "Some error ocurred, please try again.");
                }
            })
            .catch(err => {
                const data = err.response && err.response.data;
                this.setHasError((data && data.msg) || "Some error ocurred, please try again.");
            })
    }
    buildErrorComponent = () => {
        return this.state.errorMsg && <div style={{ width: '50%' }} class="alert alert-danger" role="alert">{this.state.errorMsg}</div>
    }
    render() {
        //if not logged in go to login page
        let redirectVar = null;
        console.log("Inside Add Group");
        if (!cookie.load('cookie')) {
            redirectVar = <Redirect to="/login" />
        }
        return (
            <div class="container row">
                <div class="container col-sm-4">
                    <img src="https://assets.splitwise.com/assets/core/logo-square-65a6124237868b1d2ce2f5db2ab0b7c777e2348b797626816400534116ae22d7.svg" alt="Logo" />
                </div>
                {redirectVar}
                {this.renderRedirect()}
                {this.buildErrorComponent()}
                <form>
                    <div class="container col-sm-8">
                        <div style={{ width: "50%", float: "left" }} class="form-group">
                            <h2>Start A New Group</h2>
                            <h4>My Group should be called...</h4>
                            <input type="text" onChange={this.bookIdHandler} class="form-control" name="BookID" placeholder="My Trip Group" required />
                        </div>
                        <div style={{ width: "50%" }}>
                            <button class="btn btn-success" onClick={this.submitDelete} type="submit">Save</button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

export default AddGroup;