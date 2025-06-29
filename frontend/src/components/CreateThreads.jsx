import React, { useState } from 'react';
import {
  Container,
  Button,
  Form,
  FormGroup,
  FormLabel,
  FormCheck,
} from 'react-bootstrap';

function CreateThread() {
  const [formData, setFormData] = useState({
    title: '',
    is_public: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const threadData = new FormData();
      threadData.append('title', formData.title);
      threadData.append('is_public', formData.is_public);

      if (formData.image) {
        threadData.append('image', formData.image);
      }

      const response = await fetch('http://localhost:8000/api/threads/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
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
        <FormGroup controlId="title" className="mb-5 form-control-lg">
          <FormLabel>Title</FormLabel>
          <Form.Control
            type="text"
            placeholder="Enter thread title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup controlId="type" className="mb-5 form-control-lg">
          <FormLabel>Type</FormLabel>
          <FormCheck
            type="radio"
            label="Public"
            name="is_public"
            value="1"
            checked={formData.is_public === '1'}
            onChange={handleChange}
          />
          <FormCheck
            type="radio"
            label="Private"
            name="is_public"
            value="0"
            checked={formData.is_public === '0'}
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
