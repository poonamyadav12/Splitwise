import React from 'react';
import AvatarEditor from 'react-avatar-editor';
import { Container } from 'react-bootstrap';
import Dropzone from 'react-dropzone';

export class UploadImage extends React.Component {
    state = {
        image: 'http://example.com/initialimage.jpg',
    }

    handleDrop = dropped => {
        this.setState({ image: dropped[0] })
    }

    render() {
        return (
            <Container>
                <Dropzone
                    onDrop={this.handleDrop}
                    style={{ width: '150px', height: '150px' }}
                >
                    {({ getRootProps, getInputProps }) => (
                        <div {...getRootProps()}>
                            <AvatarEditor
                                width={100}
                                height={100}
                                border={50}
                                scale={1.2}
                                rotate={0}
                                image={this.state.image} />
                            <input {...getInputProps()} />
                        </div>
                    )}
                </Dropzone>
            </Container>
        )
    }
}