import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import cookie from 'react-cookies';
import { Redirect } from 'react-router';
import { FaTag } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ListGroup, Card } from 'react-bootstrap';

export class GroupList extends Component {

    constructor(props) {
        super(props);
        this.state = { groups: [] };
    }

    componentDidMount() {
        axios.get('http://localhost:3001/user/groups/' + this.props.userId)
            .then((response) => {
                //update the state with the response data
                this.setState({
                    groups: response.data
                });
            });
    }

    render() {
        return <Card style={{ width: '15rem' }}>
            <ListGroup variant="flush">
                <ListGroup.Item><GroupName groupName="First Group" groupId="123" /></ListGroup.Item>
                <ListGroup.Item><GroupName groupName="Second Group" groupId="123" /></ListGroup.Item>
                <ListGroup.Item><GroupName groupName="Third Group" groupId="123" /></ListGroup.Item>
                <ListGroup.Item><GroupName groupName="Fourth Group" groupId="123" /></ListGroup.Item>
            </ListGroup>
        </Card>;
    }
}

const GroupName = (props) => <div><FaTag />&nbsp;<Link to={"/groupPreview" + props.groupId}>{props.groupName}</Link></div>