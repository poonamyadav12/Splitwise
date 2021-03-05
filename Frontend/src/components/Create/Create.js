import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';
import cookie from 'react-cookies';

class Create extends Component {

    constructor(props) {
        //Call the constrictor of Super class i.e The Component
        super(props);
        this.state = {
            bookId: "",
            bookTitle: "",
            bookAuthor: "",
            redirect: false,
            errorMsg: "",
        }
        this.bookIdHandler = this.bookIdHandler.bind(this);
        this.bookTitleHandler = this.bookTitleHandler.bind(this);
        this.bookAuthorhandler = this.bookAuthorhandler.bind(this);
        this.submitCreate = this.submitCreate.bind(this);
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
    bookIdHandler = (e) => {
        this.setState({
            bookId: e.target.value
        })
    }
    bookTitleHandler = (e) => {
        this.setState({
            bookTitle: e.target.value
        })
    }
    bookAuthorhandler = (e) => {
        this.setState({
            bookAuthor: e.target.value
        })
    }
    submitCreate = (e) => {
        e.preventDefault();
        const data = {
            bookId: this.state.bookId,
            bookTitle: this.state.bookTitle,
            bookAuthor: this.state.bookAuthor
        }
        axios.post('http://localhost:3001/create', data)
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
        return this.state.errorMsg && <div style={{ width: '30%' }} class="alert alert-danger" role="alert">{this.state.errorMsg}</div>
    }

    render() {
        //if not logged in go to login page
        let redirectVar = null;
        if (!cookie.load('cookie')) {
            redirectVar = <Redirect to="/login" />
        }
        return (
            <div>
                {redirectVar}
                {this.renderRedirect()}
                <br />
                <div class="container">
                    {this.buildErrorComponent()}
                    <form >
                        <div style={{ width: '30%' }} class="form-group">
                            <input type="number" onChange={this.bookIdHandler} class="form-control" name="BookID" placeholder="Book ID" required />
                        </div>
                        <br />
                        <div style={{ width: '30%' }} class="form-group">
                            <input type="text" onChange={this.bookTitleHandler} class="form-control" name="Title" placeholder="Book Title" required />
                        </div>
                        <br />
                        <div style={{ width: '30%' }} class="form-group">
                            <input type="text" onChange={this.bookAuthorhandler} class="form-control" name="Author" placeholder="Book Author" required />
                        </div>
                        <br />
                        <div style={{ width: '30%' }}>
                            <button class="btn btn-success" onClick={this.submitCreate} type="submit">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}


export default Create;