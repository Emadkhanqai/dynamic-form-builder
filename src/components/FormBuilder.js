// src/components/FormBuilder.js
import React, { useState, useEffect, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import DraggableField from "./DraggableField";
import FieldAttributes from "./FieldAttributes";
import ParentFieldModal from "./ParentFieldModal";
import { getDefaultFieldValues } from "../utils/fieldTypes";
import apiService from "../services/api";

const FormBuilder = () => {
  const [fields, setFields] = useState([]);
  const [expandedFields, setExpandedFields] = useState({});
  const [selectedField, setSelectedField] = useState(null);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [isNewField, setIsNewField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [versionId, setVersionId] = useState("");
  const [editingParent, setEditingParent] = useState(false);

  
  // Add this function to handle version change
  const handleVersionChange = (newVersionId) => {
    setVersionId(newVersionId);
  };

  // Debug function to inspect the current state
  const debugState = () => {
    console.log("Current fields state:", fields);
    console.log("Expanded fields:", expandedFields);
    console.log(
      "Field values:",
      fields.map((field) => field.values)
    );
  };

  // Load existing form configuration if available
  useEffect(() => {
    const loadFormConfiguration = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Attempt to load configuration from API
        const formData = await apiService.getDynamicForm();
        if (formData && formData.length > 0) {
          // Transform API data to component state format
          const transformedFields = transformApiDataToFields(formData);
          setFields(transformedFields);

          // Expand all top-level fields by default
          const expanded = {};
          transformedFields.forEach((field) => {
            expanded[field.id] = true;
          });
          setExpandedFields(expanded);
        }
      } catch (error) {
        console.error("Error loading form configuration:", error);
        setError("Failed to load form configuration. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadFormConfiguration();
  }, []);

  // Transform API data to component state format
  const transformApiDataToFields = (apiData) => {
    return apiData.map((item) => transformApiItem(item));
  };

  // Recursive function to transform an API item to field format
  const transformApiItem = (item) => {
    const field = {
      id: uuidv4(),
      values: {
        code: item.Code,
        fieldCode: item.FieldCode,
        sortOrder: item.SortOrder || 0,
        fieldType: item.FieldTypeId,
        customValidation: item.CustomValidationId,
        placeholder: item.Placeholder,
        question: item.QuestionId,
        lookupSourceMapping: item.LookupSourceMappingId,
        isRtl: item.IsRtl,
        helperTextCode: item.HelperTextCode,
        guideUrl: item.GuideUrl,
        guideUrlMode: item.GuideUrlMode,
        guideUrlType: item.GuideUrlType,
        enabled: item.Enabled,
        display: item.Display,
        required: item.Required,
        versionId: item.VersionId,
        canTriggerWorkflow: item.CanTriggerWorkflow,
        displayWorkflowGroup: item.DisplayWorkflowGroupId,
        isDynamicQuestion: item.IsDynamicQuestion,
        pageTitle: item.PageTitle,
        pageButtonTitle: item.PageButtonTitle,
        allowSubmission: item.AllowSubmission,
        pageBreak: item.PageBreak,
        dropdownDependency: item.DropdownDependencyId,
        defaultValue: item.DefaultValue,
      },
      childSections: item.ChildSections
        ? item.ChildSections.map((child) => transformApiItem(child))
        : [],
    };

    return field;
  };

  // Transform component state to API format
  const transformFieldsToApiData = (fields) => {
    return fields.map((field) => transformFieldToApiItem(field));
  };

  // Recursive function to transform a field to API format
  const transformFieldToApiItem = (field) => {
    const apiItem = {
      Code: field.values.code,
      FieldCode: field.values.fieldCode,
      SortOrder: field.values.sortOrder || 0,
      FieldTypeId: field.values.fieldType,
      CustomValidationId: field.values.customValidation,
      Placeholder: field.values.placeholder,
      QuestionId: field.values.question,
      LookupSourceMappingId: field.values.lookupSourceMapping,
      IsRtl: field.values.isRtl || false,
      HelperTextCode: field.values.helperTextCode,
      GuideUrl: field.values.guideUrl,
      GuideUrlMode: field.values.guideUrlMode,
      GuideUrlType: field.values.guideUrlType,
      Enabled: field.values.enabled || false,
      Display: field.values.display || false,
      Required: field.values.required || false,
      VersionId: field.values.versionId,
      CanTriggerWorkflow: field.values.canTriggerWorkflow || false,
      DisplayWorkflowGroupId: field.values.displayWorkflowGroup,
      IsDynamicQuestion: field.values.isDynamicQuestion || false,
      PageTitle: field.values.pageTitle,
      PageButtonTitle: field.values.pageButtonTitle,
      AllowSubmission: field.values.allowSubmission || false,
      PageBreak: field.values.pageBreak || false,
      DropdownDependencyId: field.values.dropdownDependency,
      DefaultValue: field.values.defaultValue,
      ChildSections:
        field.childSections && field.childSections.length > 0
          ? field.childSections.map((child) => transformFieldToApiItem(child))
          : [],
    };

    return apiItem;
  };

  // Find a field by ID in the nested structure
  const findField = (id, fieldsArray = fields) => {
    for (const field of fieldsArray) {
      if (field.id === id) {
        return field;
      }

      if (field.childSections && field.childSections.length > 0) {
        const found = findField(id, field.childSections);
        if (found) {
          return found;
        }
      }
    }

    return null;
  };

  // Find parent of a field
  const findParentField = (id, fieldsArray = fields, parent = null) => {
    for (const field of fieldsArray) {
      if (field.id === id) {
        return parent;
      }

      if (field.childSections && field.childSections.length > 0) {
        const found = findParentField(id, field.childSections, field);
        if (found) {
          return found;
        }
      }
    }

    return null;
  };

  // Add a new field (not a parent)
  const addField = (parentId = null) => {
    const newField = {
      id: uuidv4(),
      values: getDefaultFieldValues(),
      childSections: [],
    };

    if (!parentId) {
      // Add as a top-level field
      setFields([...fields, newField]);
    } else {
      // Add as a child field
      updateFieldsRecursively(fields, parentId, (field) => {
        field.childSections = [...(field.childSections || []), newField];
        return field;
      });
    }

    // Select the new field for editing
    setSelectedField(newField);
    setIsNewField(true);
    setShowFieldModal(true);
  };

  // Add a new parent field
  const addParentField = (parentId = null) => {
    setSelectedParentId(parentId);
    setShowParentModal(true);
  };

  // Save parent field from ParentFieldModal
  const saveParentField = (values) => {
    console.log("Saving parent field with values:", values);
  
    if (editingParent && selectedField) {
      // We're editing an existing parent field
      console.log("Updating existing parent field:", selectedField.id);
      
      // Update the existing field's values
      updateFieldsRecursively(fields, selectedField.id, (field) => {
        field.values = {
          ...field.values, // Keep existing values not in the form
          code: values.code,
          sortOrder: values.sortOrder || 0,
          fieldType: values.fieldType,
          pageTitle: values.pageTitle,
          pageButtonTitle: values.pageButtonTitle,
          allowSubmission: values.allowSubmission || false,
          pageBreak: values.pageBreak || false,
          helperTextCode: values.helperTextCode || values.code
        };
        return field;
      });
      
      // Show success message
      setSuccessMessage("Parent field updated successfully!");
    } else {
      // Creating a new parent field - use your existing code
      const newParentField = {
        id: uuidv4(),
        values: {
          code: values.code,
          sortOrder: values.sortOrder || 0,
          fieldType: values.fieldType,
          pageTitle: values.pageTitle,
          pageButtonTitle: values.pageButtonTitle,
          allowSubmission: values.allowSubmission || false,
          pageBreak: values.pageBreak || false,
          // Additional required fields with defaults
          helperTextCode: values.helperTextCode || values.code,
          enabled: true,
          display: true,
          isRtl: false,
        },
        childSections: [],
      };
  
      if (!selectedParentId) {
        // Add as a top-level parent
        setFields([...fields, newParentField]);
      } else {
        // Add as a nested parent
        updateFieldsRecursively(fields, selectedParentId, (field) => {
          field.childSections = [...(field.childSections || []), newParentField];
          return field;
        });
  
        // Expand the parent field
        setExpandedFields({
          ...expandedFields,
          [selectedParentId]: true,
        });
      }
  
      // Expand the new parent field by default
      setExpandedFields({
        ...expandedFields,
        [newParentField.id]: true,
      });
  
      // Show success message
      setSuccessMessage("Parent field added successfully!");
    }
  
    // Clear states
    setSelectedField(null);
    setEditingParent(false);
    setSelectedParentId(null);
    
    // Clear success message after timeout
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Edit a field
// Modify the editField function to identify if we're editing a parent field
const editField = (id) => {
  const field = findField(id);
  if (field) {
    // Set the selected field first
    setSelectedField(field);
    
    // Check if this is a parent field (header or accordion)
    const isParentField = field.values?.fieldType === 'header' || field.values?.fieldType === 'accordion';
    
    if (isParentField) {
      // For parent fields, use the parent field modal
      setEditingParent(true);
      setIsNewField(false); // Not a new field since we're editing
      setShowParentModal(true);
      setShowFieldModal(false); // Ensure the other modal is closed
    } else {
      // For regular fields, use the field attributes modal
      setEditingParent(false);
      setIsNewField(false);
      setShowFieldModal(true);
      setShowParentModal(false); // Ensure the other modal is closed
    }
  }
};


  // Save field changes
  const saveField = (values) => {
    console.log("Saving field with values:", values);

    if (isNewField) {
      // For new fields, the field is already added to the structure
      // Just need to update its values
      updateFieldsRecursively(fields, selectedField.id, (field) => {
        field.values = values;
        return field;
      });
    } else {
      // For existing fields, update the values
      updateFieldsRecursively(fields, selectedField.id, (field) => {
        field.values = values;
        return field;
      });
    }

    // Show success message
    setSuccessMessage("Field saved successfully!");
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);

    setSelectedField(null);
    setShowFieldModal(false);
  };

  // Delete a field
  const deleteField = (id) => {
    const parent = findParentField(id);

    if (!parent) {
      // Top-level field
      setFields(fields.filter((field) => field.id !== id));
    } else {
      // Child field
      updateFieldsRecursively(fields, parent.id, (field) => {
        field.childSections = field.childSections.filter(
          (child) => child.id !== id
        );
        return field;
      });
    }
  };

  // Add a child field
  const addChildField = (parentId) => {
    addField(parentId);

    // Expand the parent field
    setExpandedFields({
      ...expandedFields,
      [parentId]: true,
    });
  };

  // Add a child parent field
  const addChildParent = (parentId) => {
    addParentField(parentId);

    // Expand the parent field
    setExpandedFields({
      ...expandedFields,
      [parentId]: true,
    });
  };

  // Toggle field expand/collapse
  const toggleExpand = (id) => {
    setExpandedFields({
      ...expandedFields,
      [id]: !expandedFields[id],
    });
  };

  // Move a field up in the order
  const moveFieldUp = (id) => {
    const parent = findParentField(id);
    const fieldsArray = parent ? parent.childSections : fields;
    const index = fieldsArray.findIndex((field) => field.id === id);

    if (index > 0) {
      const newFieldsArray = [...fieldsArray];
      [newFieldsArray[index - 1], newFieldsArray[index]] = [
        newFieldsArray[index],
        newFieldsArray[index - 1],
      ];

      if (!parent) {
        setFields(newFieldsArray);
      } else {
        updateFieldsRecursively(fields, parent.id, (field) => {
          field.childSections = newFieldsArray;
          return field;
        });
      }
    }
  };

  // Move a field down in the order
  const moveFieldDown = (id) => {
    const parent = findParentField(id);
    const fieldsArray = parent ? parent.childSections : fields;
    const index = fieldsArray.findIndex((field) => field.id === id);

    if (index < fieldsArray.length - 1) {
      const newFieldsArray = [...fieldsArray];
      [newFieldsArray[index], newFieldsArray[index + 1]] = [
        newFieldsArray[index + 1],
        newFieldsArray[index],
      ];

      if (!parent) {
        setFields(newFieldsArray);
      } else {
        updateFieldsRecursively(fields, parent.id, (field) => {
          field.childSections = newFieldsArray;
          return field;
        });
      }
    }
  };

  // Move a field to a new parent (drag and drop)
  const moveField = (sourceId, targetId) => {
    const sourceField = findField(sourceId);
    const targetField = findField(targetId);

    if (!sourceField || !targetField) return;

    // Remove the source field from its current location
    const sourceParent = findParentField(sourceId);
    if (!sourceParent) {
      // Top-level field
      setFields(fields.filter((field) => field.id !== sourceId));
    } else {
      // Child field
      updateFieldsRecursively(fields, sourceParent.id, (field) => {
        field.childSections = field.childSections.filter(
          (child) => child.id !== sourceId
        );
        return field;
      });
    }

    // Add the source field to the target field's children
    updateFieldsRecursively(fields, targetId, (field) => {
      field.childSections = [...(field.childSections || []), sourceField];
      return field;
    });

    // Expand the target field
    setExpandedFields({
      ...expandedFields,
      [targetId]: true,
    });
  };

  // Helper function to update fields recursively
  const updateFieldsRecursively = (fieldsArray, id, updateFn) => {
    const newFields = [...fieldsArray];

    for (let i = 0; i < newFields.length; i++) {
      if (newFields[i].id === id) {
        newFields[i] = updateFn(newFields[i]);
        setFields(newFields);
        return true;
      }

      if (newFields[i].childSections && newFields[i].childSections.length > 0) {
        if (updateFieldsRecursively(newFields[i].childSections, id, updateFn)) {
          setFields(newFields);
          return true;
        }
      }
    }

    return false;
  };

  // Submit the form configuration
  const submitForm = async () => {
    console.log("Form submission initiated");
    console.log("Current fields:", fields);

    // Check if we have any fields first
    if (fields.length === 0) {
      setError(
        "Please add at least one parent field before saving the form configuration."
      );
      return;
    }

    // Check if all required fields have values
    let hasValidationErrors = false;
    const validateFields = (fieldsArray) => {
      for (const field of fieldsArray) {
        // Check if this field has all required values
        if (
          !field.values.code ||
          !field.values.fieldType ||
          !field.values.helperTextCode
        ) {
          hasValidationErrors = true;
          return;
        }

        // Check child fields recursively
        if (field.childSections && field.childSections.length > 0) {
          validateFields(field.childSections);
        }
      }
    };

    validateFields(fields);

    if (hasValidationErrors) {
      setError(
        "Some fields have missing required values. Please edit each field and provide the required information."
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const apiData = transformFieldsToApiData(fields);
      console.log("Submitting form configuration:", apiData);

      // If backend API is not ready, show a success message anyway
      if (process.env.NODE_ENV === "development") {
        setSuccessMessage(
          "Form configuration saved successfully! (Development mode - API call simulated)"
        );
        console.log("API submission simulated in development mode");
      } else {
        await apiService.createDynamicForm(apiData);
        setSuccessMessage("Form configuration saved successfully!");
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error submitting form configuration:", error);
      setError("Failed to save form configuration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render fields recursively
  const renderFields = (fieldsArray, level = 0) => {
    return fieldsArray.map((field) => (
      <React.Fragment key={field.id}>
        <DraggableField
          id={field.id}
          index={fieldsArray.indexOf(field)}
          moveField={moveField}
          field={field}
          level={level}
          onEdit={editField}
          onDelete={deleteField}
          onAddChild={addChildField}
          onAddChildParent={addChildParent}
          onMoveUp={moveFieldUp}
          onMoveDown={moveFieldDown}
          isExpanded={expandedFields[field.id]}
          toggleExpand={toggleExpand}
        />

        {expandedFields[field.id] &&
          field.childSections &&
          field.childSections.length > 0 && (
            <div className="ms-4">
              {renderFields(field.childSections, level + 1)}
            </div>
          )}
      </React.Fragment>
    ));
  };

  // Render content area with actions inside the form area
  const renderContentArea = () => {
    if (isLoading && fields.length === 0) {
      return (
        <div className="text-center p-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading form configuration...</p>
        </div>
      );
    }

    if (fields.length === 0) {
      return (
        <div className="text-center p-5 border rounded bg-light">
          <p>No fields added yet. Click "Add Parent" to get started.</p>
          <Button
            variant="primary"
            onClick={() => addParentField()}
            disabled={isLoading}
          >
            Add Parent
          </Button>
        </div>
      );
    }

    return (
      <div className="border rounded p-3 bg-light">
        {renderFields(fields)}

        <div className="mt-3 p-2 text-right border-top pt-3">
          <Button
            variant="primary"
            onClick={() => addParentField()}
            disabled={isLoading}
            className="me-2"
          >
            Add Parent
          </Button>
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Container fluid className="mt-4 mb-4">
        <Row className="mb-3">
          <Col>
            <h1>Dynamic Form Builder</h1>
            <p className="text-muted">
              Create a dynamic form with nested fields, drag and drop to
              reorder, and set field properties.
            </p>
          </Col>
        </Row>

        {error && (
          <Row className="mb-3">
            <Col>
              <Alert variant="danger">{error}</Alert>
            </Col>
          </Row>
        )}

        {successMessage && (
          <Row className="mb-3">
            <Col>
              <Alert variant="success">{successMessage}</Alert>
            </Col>
          </Row>
        )}

        <Row className="mb-3">
          <Col>
            {fields.length > 0 && (
              <Button
                variant="success"
                onClick={submitForm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Saving...
                  </>
                ) : (
                  "Save Form Configuration"
                )}
              </Button>
            )}
            {process.env.NODE_ENV === "development" && (
              <Button
                variant="outline-secondary"
                className="ms-2"
                onClick={debugState}
              >
                Debug
              </Button>
            )}
          </Col>
        </Row>

        <Row>
          <Col>{renderContentArea()}</Col>
        </Row>
      </Container>

      {showFieldModal && selectedField && (
        <FieldAttributes
          show={showFieldModal}
          onHide={() => {
            setShowFieldModal(false);
            setSelectedField(null);
          }}
          field={selectedField}
          onSave={saveField}
          isNew={isNewField}
        />
      )}

{showParentModal && (
  <ParentFieldModal
    show={showParentModal}
    onHide={() => {
      setShowParentModal(false);
      setSelectedField(null);
      setEditingParent(false);
      setSelectedParentId(null);
    }}
    field={editingParent ? selectedField : null}
    onSave={saveParentField}
    isNew={!editingParent}
    parentVersionId={versionId}
  />
)}
    </DndProvider>
  );
};

export default FormBuilder;
