import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';
import cookie from 'react-cookies';

class Delete extends Component {
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
        if (!cookie.load('cookie')) {
            redirectVar = <Redirect to="/login" />
        }
        return (
            <div class="container">
                {redirectVar}
                {this.renderRedirect()}
                {this.buildErrorComponent()}
                <form>
                    <div style={{ width: "50%", float: "left" }} class="form-group">
                        <input type="number" onChange={this.bookIdHandler} class="form-control" name="BookID" placeholder="Search a Book by Book ID" required />
                    </div>
                    <div style={{ width: "50%", float: "right" }}>
                        <button class="btn btn-success" onClick={this.submitDelete} type="submit">Delete</button>
                    </div>
                </form>
            </div>
        )
    }
}

export default Delete;