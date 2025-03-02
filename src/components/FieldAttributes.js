// src/components/FieldAttributes.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Tab } from 'react-bootstrap';
import { FIELD_DEFINITIONS, FIELD_TYPES, FIELD_GROUPS, validateField } from '../utils/fieldTypes';
import apiService from '../services/api';

const FieldAttributes = ({ show, onHide, field, onSave, isNew, parentVersionId }) => {
  const [values, setValues] = useState({});
  const [validation, setValidation] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lookupData, setLookupData] = useState({});
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [entityColumns, setEntityColumns] = useState([]);
  const [activeDataSources, setActiveDataSources] = useState([]);
  const [activeKey, setActiveKey] = useState(FIELD_GROUPS[0]?.name || 'Basic Information');

  // Debug helper function
  const debugField = (field) => {
    console.log('Field to edit:', field);
    if (field && field.values) {
      console.log('Field values:', field.values);
    }
  };

  const handleTabClick = (e, tabName) => {
    e.preventDefault(); // Prevent the default form submission
    setActiveKey(tabName);
  };

  // Initialize form values when field changes
  useEffect(() => {
    if (field) {
      // Debug the incoming field
      debugField(field);
      
      // Set default values for required fields if they're missing
      const defaultValues = {
        ...field.values,
        // Pass parent version ID if available
        versionId: parentVersionId || field.values?.versionId || '',
        
        // Set defaults for checkboxes
        isRtl: field.values?.isRtl || false,
        enabled: field.values?.enabled || false,
        display: field.values?.display || false,
        required: field.values?.required || false,
        canTriggerWorkflow: field.values?.canTriggerWorkflow || false,
        isDynamicQuestion: field.values?.isDynamicQuestion || false,
        allowSubmission: field.values?.allowSubmission || false,
        pageBreak: field.values?.pageBreak || false
      };
      
      setValues(defaultValues);
      
      // If field has entity value, load its columns
      if (field.values?.entity) {
        setSelectedEntity(field.values.entity);
        loadEntityColumns(field.values.entity);
      }
    }
  }, [field, parentVersionId]);

  // Load all needed lookup data for dropdown fields
  useEffect(() => {
    // Collect all unique data sources from fields that are dropdowns
    const dataSources = FIELD_DEFINITIONS
      .filter(field => field.type === FIELD_TYPES.DROPDOWN && field.dataSource)
      .map(field => field.dataSource);
    
    // Remove duplicates
    const uniqueDataSources = [...new Set(dataSources)];
    setActiveDataSources(uniqueDataSources);
    
    // Load data for each data source
    uniqueDataSources.forEach(dataSource => {
      loadLookupData(dataSource);
    });
  }, []);

  // Load lookup data for dropdown fields
  const loadLookupData = async (dataSource) => {
    if (lookupData[dataSource]) return;

    setIsLoading(true);
    try {
      const data = await apiService.getLookupData(dataSource);
      setLookupData(prev => ({
        ...prev,
        [dataSource]: data
      }));
    } catch (error) {
      console.error(`Error loading lookup data for ${dataSource}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load entity columns when entity changes
  const loadEntityColumns = async (entityId) => {
    if (!entityId) return;

    setIsLoading(true);
    try {
      const columns = await apiService.getEntityColumns(entityId);
      setEntityColumns(columns);
    } catch (error) {
      console.error(`Error loading columns for entity ${entityId}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (id, value) => {
    setValues(prev => ({
      ...prev,
      [id]: value
    }));

    // For entity field, load its columns
    if (id === 'entity' && value !== selectedEntity) {
      setSelectedEntity(value);
      loadEntityColumns(value);
      
      // Reset fieldCode when entity changes
      setValues(prev => ({
        ...prev,
        fieldCode: ''
      }));
    }

    // Clear validation errors for this field
    if (validation[id]) {
      setValidation(prev => {
        const newValidation = { ...prev };
        delete newValidation[id];
        return newValidation;
      });
    }
  };

  // Simplified validation - only Code and Field Type are required
  const validateForm = (formValues) => {
    console.log('Running validation with values:', formValues);
    const errors = {};
    
    // Only Code and Field Type are required
    if (!formValues.code) {
      errors.code = 'Code is required';
    }
    
    if (!formValues.fieldType) {
      errors.fieldType = 'Field Type is required';
    }
    
    console.log('Validation errors:', errors);
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Attempting to save field with values:', values);
    
    // Check if we have the absolute minimum required values
    const isValid = validateForm(values);
    
    if (isValid) {
      console.log('Validation passed, saving field');
      
      // Make sure to use parent version ID if available
      const finalValues = {
        ...values,
        versionId: parentVersionId || values.versionId
      };
      
      onSave(finalValues);
      onHide();
    } else {
      console.log('Validation failed with errors:', validation);
    }
  };

  // Render form field based on field type
  const renderField = (fieldDef) => {
    // Skip rendering version ID field as it's now at parent level
    if (fieldDef.id === 'versionId') {
      return null;
    }
    
    // Check if field should be visible based on conditional visibility
    if (fieldDef.conditionalVisibility) {
      try {
        const shouldShow = eval(fieldDef.conditionalVisibility.replace(/([a-zA-Z0-9_]+)/g, 'values["$1"]'));
        if (!shouldShow) return null;
      } catch (error) {
        console.error(`Error evaluating conditional visibility for ${fieldDef.id}:`, error);
        return null;
      }
    }

    // Render field based on type
    switch (fieldDef.type) {
      case FIELD_TYPES.DROPDOWN:
        // Special case for fieldCode which depends on entity selection
        if (fieldDef.id === 'fieldCode' && selectedEntity) {
          return (
            <Form.Group className="mb-3" key={fieldDef.id}>
              <Form.Label>{fieldDef.label}</Form.Label>
              <Form.Select
                value={values[fieldDef.id] || ''}
                onChange={(e) => handleChange(fieldDef.id, e.target.value)}
                isInvalid={!!validation[fieldDef.id]}
              >
                <option value="">Select {fieldDef.label}</option>
                {entityColumns.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validation[fieldDef.id]}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {fieldDef.description}
              </Form.Text>
            </Form.Group>
          );
        }
        
        return (
          <Form.Group className="mb-3" key={fieldDef.id}>
            <Form.Label>{fieldDef.label}</Form.Label>
            <Form.Select
              value={values[fieldDef.id] || ''}
              onChange={(e) => handleChange(fieldDef.id, e.target.value)}
              isInvalid={!!validation[fieldDef.id]}
            >
              <option value="">Select {fieldDef.label}</option>
              {lookupData[fieldDef.dataSource]?.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {validation[fieldDef.id]}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              {fieldDef.description}
            </Form.Text>
          </Form.Group>
        );
        
      case FIELD_TYPES.TEXTBOX:
        return (
          <Form.Group className="mb-3" key={fieldDef.id}>
            <Form.Label>{fieldDef.label}</Form.Label>
            <Form.Control
              type="text"
              value={values[fieldDef.id] || ''}
              onChange={(e) => handleChange(fieldDef.id, e.target.value)}
              isInvalid={!!validation[fieldDef.id]}
            />
            <Form.Control.Feedback type="invalid">
              {validation[fieldDef.id]}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              {fieldDef.description}
            </Form.Text>
          </Form.Group>
        );
        
      case FIELD_TYPES.CHECKBOX:
        return (
          <Form.Group className="mb-3" key={fieldDef.id}>
            <Form.Check
              type="checkbox"
              id={`checkbox-${fieldDef.id}`}
              label={fieldDef.label}
              checked={values[fieldDef.id] || false}
              onChange={(e) => handleChange(fieldDef.id, e.target.checked)}
              isInvalid={!!validation[fieldDef.id]}
            />
            <Form.Text className="text-muted">
              {fieldDef.description}
            </Form.Text>
          </Form.Group>
        );
        
      case FIELD_TYPES.DRAGGABLE:
        // For draggable fields, just show a disabled field
        return (
          <Form.Group className="mb-3" key={fieldDef.id}>
            <Form.Label>{fieldDef.label}</Form.Label>
            <Form.Control
              type="text"
              value="This will be determined by drag & drop"
              disabled
            />
            <Form.Text className="text-muted">
              {fieldDef.description}
            </Form.Text>
          </Form.Group>
        );
        
      default:
        return (
          <Form.Group className="mb-3" key={fieldDef.id}>
            <Form.Label>{fieldDef.label}</Form.Label>
            <Form.Control
              type="text"
              value={values[fieldDef.id] || ''}
              onChange={(e) => handleChange(fieldDef.id, e.target.value)}
              isInvalid={!!validation[fieldDef.id]}
            />
            <Form.Control.Feedback type="invalid">
              {validation[fieldDef.id]}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              {fieldDef.description}
            </Form.Text>
          </Form.Group>
        );
    }
  };

  // Set up tabs for vertical layout
  const renderTabs = () => {
    return (
      <div className="d-flex">
        <div className="nav flex-column nav-pills me-3" style={{ width: '200px' }}>
          {FIELD_GROUPS.map((group) => (
            <a 
            key={group.name}
            href="#"
            className={`nav-link ${activeKey === group.name ? 'active' : ''}`}
            onClick={(e) => handleTabClick(e, group.name)}
          >
            {group.name}
          </a>
          ))}
        </div>
        <div className="tab-content flex-grow-1">
          {FIELD_GROUPS.map((group) => (
            <div
              key={group.name}
              className={`tab-pane ${activeKey === group.name ? 'show active' : ''}`}
            >
              {group.fields.map(fieldId => {
                const fieldDef = FIELD_DEFINITIONS.find(f => f.id === fieldId);
                return fieldDef ? renderField(fieldDef) : null;
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isNew ? 'Add New Field' : 'Edit Field'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {Object.keys(validation).length > 0 && (
            <Alert variant="danger">
              Please correct the validation errors below.
            </Alert>
          )}
          
          {renderTabs()}
          
          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" onClick={onHide} className="me-2" type="button">
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

export default FieldAttributes;