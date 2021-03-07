import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import cookie from 'react-cookies';
import { Redirect } from 'react-router';
import { FaTag } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ListGroup, Card, Button } from 'react-bootstrap';

export class GroupList extends Component {

    constructor(props) {
        super(props);
        this.state = { groups: [] };
    }

    componentDidMount() {
        axios.get('http://localhost:3001/user/groups?userId=' + this.props.userId)
            .then((response) => {
                //update the state with the response data
                this.setState({
                    groups: response.data
                });
            });
    }

    render() {
        return <Card style={{ width: '15rem' }}>
            {this.state.groups.length > 0 ?
                <ListGroup variant="flush">
                    {this.state.groups.map((group) =>
                        <ListGroup.Item key={group.id}><GroupName groupName={group.name} groupId={group.id} setGroupView={this.props.setGroupView} /></ListGroup.Item>
                    )}
                </ListGroup> : "No Groups to show"
            }
        </Card>;
    }
}

const GroupName = (props) => <Link to="#" onClick={() => props.setGroupView(props.groupId)} ><FaTag />&nbsp;{props.groupName}</Link>