import React, { Component } from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { FaTag } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../../App.css';


export class GroupList extends Component {

    render() {
        return <Card style={{ width: '15rem' }}>
            {this.props.groups.length > 0 ?
                <ListGroup variant="flush">
                    {this.props.groups.map((group) =>
                        <ListGroup.Item style={this.props.focussed && this.props.selectedId === group.id ? { backgroundColor: 'lightgray' } : null} key={group.id}><GroupName groupName={group.name} groupId={group.id} setGroupView={this.props.setGroupView} /></ListGroup.Item>
                    )}
                </ListGroup> : "No Groups to show"
            }
        </Card>
    }
}

const GroupName = (props) => <Link to="#" onClick={() => props.setGroupView(props.groupId)} ><FaTag />&nbsp;{props.groupName}</Link>