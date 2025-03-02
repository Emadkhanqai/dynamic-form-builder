// src/components/ParentFieldModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import apiService from '../services/api';

const ParentFieldModal = ({ show, onHide, onSave, parentVersionId, isNew = true }) => {
  const [values, setValues] = useState({
    code: '',
    sortOrder: 0,
    fieldType: '',
    pageTitle: '',
    pageButtonTitle: '',
    allowSubmission: false,
    pageBreak: false
  });
  
  const [validation, setValidation] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lookupData, setLookupData] = useState({
    codes: []
  });

  // Load lookup data on component mount
  useEffect(() => {
    const loadLookupData = async () => {
      setIsLoading(true);
      try {
        // Load codes (global localization)
        const codes = await apiService.getLookupData('Global Localization (Lookup)');
        setLookupData({
          codes
        });
      } catch (error) {
        console.error('Error loading lookup data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLookupData();
  }, []);

  // Handle input changes
  const handleChange = (id, value) => {
    setValues(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear validation error when field is updated
    if (validation[id]) {
      setValidation(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  // Validate the form
  const validateForm = () => {
    const errors = {};
    
    // Check required fields
    if (!values.code) {
      errors.code = 'Code is required';
    }
    
    if (!values.fieldType) {
      errors.fieldType = 'Field Type is required';
    }
    
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Attempting to save parent field:', values);
    
    if (validateForm()) {
      onSave({
        ...values,
        // Set additional default values for API compatibility
        helperTextCode: values.code, // Use code as helper text code by default
        enabled: true,
        display: true,
        isRtl: false,
        versionId: parentVersionId // Use parent version ID
      });
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isNew ? 'Add Parent Field' : 'Edit Parent Field'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {Object.keys(validation).length > 0 && (
            <Alert variant="danger">
              Please correct the validation errors below.
            </Alert>
          )}
          
          {/* Code (Required) */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>Code</Form.Label>
            <Col sm={8}>
              <Form.Select
                value={values.code}
                onChange={(e) => handleChange('code', e.target.value)}
                isInvalid={!!validation.code}
              >
                <option value="">Select Code</option>
                {lookupData.codes?.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validation.code}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Value must be taken from global localization lookup.
              </Form.Text>
            </Col>
          </Form.Group>
          
          {/* Sort Order (Default 0) */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>Sort Order</Form.Label>
            <Col sm={8}>
              <Form.Control
                type="number"
                value={values.sortOrder}
                onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 0)}
              />
              <Form.Text className="text-muted">
                Determines order; default is 0.
              </Form.Text>
            </Col>
          </Form.Group>
          
          {/* Field Type (Required) - Only Header or Accordion */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>Field Type</Form.Label>
            <Col sm={8}>
              <Form.Select
                value={values.fieldType}
                onChange={(e) => handleChange('fieldType', e.target.value)}
                isInvalid={!!validation.fieldType}
              >
                <option value="">Select Field Type</option>
                <option value="header">Header</option>
                <option value="accordion">Accordion</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validation.fieldType}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Parent fields can only be Header or Accordion type.
              </Form.Text>
            </Col>
          </Form.Group>
          
          {/* Page Title (Optional) */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>Page Title</Form.Label>
            <Col sm={8}>
              <Form.Control
                type="text"
                value={values.pageTitle || ''}
                onChange={(e) => handleChange('pageTitle', e.target.value)}
              />
              <Form.Text className="text-muted">
                Optional title for the page.
              </Form.Text>
            </Col>
          </Form.Group>
          
          {/* Page Button Title (Optional) */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>Page Button Title</Form.Label>
            <Col sm={8}>
              <Form.Control
                type="text"
                value={values.pageButtonTitle || ''}
                onChange={(e) => handleChange('pageButtonTitle', e.target.value)}
              />
              <Form.Text className="text-muted">
                Optional title for the page button.
              </Form.Text>
            </Col>
          </Form.Group>
          
          {/* Allow Submission */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>Allow Submission</Form.Label>
            <Col sm={8}>
              <Form.Check
                type="checkbox"
                checked={values.allowSubmission || false}
                onChange={(e) => handleChange('allowSubmission', e.target.checked)}
                label="Checkbox input, default is FALSE"
              />
            </Col>
          </Form.Group>
          
          {/* Page Break */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>Page Break</Form.Label>
            <Col sm={8}>
              <Form.Check
                type="checkbox"
                checked={values.pageBreak || false}
                onChange={(e) => handleChange('pageBreak', e.target.checked)}
                label="Checkbox input, default is FALSE"
              />
            </Col>
          </Form.Group>
          
          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ParentFieldModal;