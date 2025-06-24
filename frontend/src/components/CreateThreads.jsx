import React, { useState } from 'react';
import { Container, Button, Form, FormControl, FormGroup, FormLabel, FormCheck } from 'react-bootstrap';

function CreateThread() {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    tags: '',
    image: null,
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem('access');
      const threadData = new FormData();

      threadData.append('name', formData.name);
      threadData.append('type', formData.type);
      /*threadData.append('description', formData.description);
      threadData.append('tags', formData.tags);*/

      if (formData.image) {
        threadData.append('image', formData.image);
      }

      console.log([...threadData.entries()]);

      const response = await fetch('http://localhost:8000/api/threads/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: threadData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Thread created successfully!');
      } else {
        setMessage(data.detail || 'Error occurred.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error.');
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <FormGroup controlId="name" className="mb-5 form-control-lg">
          <FormLabel>Name</FormLabel>
          <Form.Control
            type="text"
            placeholder="Enter name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup controlId="type" className="mb-5 form-control-lg">
          <FormLabel>Type</FormLabel>
          <FormCheck
            type="radio"
            label="Public"
            name="type"
            value="C"
            checked={formData.type === 'C'}
            onChange={handleChange}
          />
          <FormCheck
            type="radio"
            label="Private"
            name="type"
            value="P"
            checked={formData.type === 'P'}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup controlId="description" className="mb-5 form-control-lg">
          <FormLabel>Description</FormLabel>
          <FormControl
            as="textarea"
            rows={5}
            placeholder="Enter description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup controlId="tags" className="mb-5 form-control-lg">
          <FormLabel>Tags</FormLabel>
          <Form.Control
            type="text"
            placeholder="Enter tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup controlId="image" className="mb-5 form-control-lg">
          <FormLabel>Image</FormLabel>
          <FormControl
            type="file"
            name="image"
            onChange={handleChange}
          />
        </FormGroup>

        <div className="text-end mb-5 btn-lg">
          <Button variant="primary" type="submit">
            Create Thread
          </Button>
        </div>
      </Form>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}
    </Container>
  );
}

export default CreateThread;
