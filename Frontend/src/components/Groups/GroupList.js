import { FaTag } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ListGroup, Card, Button } from 'react-bootstrap';
import { Redirect } from 'react-router';
import axios from 'axios';
import cookie from 'react-cookies';
import React, { Component } from 'react';

import '../../App.css';

export class GroupList extends Component {

    render() {
        return <Card style={{ width: '15rem' }}>
            {this.props.groups.length > 0 ?
                <ListGroup variant="flush">
                    {this.props.groups.map((group) =>
                        <ListGroup.Item key={group.id}><GroupName groupName={group.name} groupId={group.id} setGroupView={this.props.setGroupView} /></ListGroup.Item>
                    )}
                </ListGroup> : "No Groups to show"
            }
        </Card>
    }
}

const GroupName = (props) => <Link to="#" onClick={() => props.setGroupView(props.groupId)} ><FaTag />&nbsp;{props.groupName}</Link>