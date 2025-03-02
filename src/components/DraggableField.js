// src/components/DraggableField.js
import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Card, Button, Row, Col, ButtonGroup, Badge } from "react-bootstrap";

const ItemTypes = {
  FIELD: "field",
};

const DraggableField = ({
  id,
  index,
  moveField,
  field,
  level,
  onEdit,
  onDelete,
  onAddChild,
  onAddChildParent,
  onMoveUp,
  onMoveDown,
  isExpanded,
  toggleExpand,
  parentId = null,
  onAddSibling = null,
  onClone = null
}) => {
  const ref = useRef(null);

  // Determine if this is a parent field (header or accordion)
  const isParentField =
    field.values?.fieldType === "header" ||
    field.values?.fieldType === "accordion";

  // Only allow parent fields to be dragged
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.FIELD,
    item: { id, index, level },
    canDrag: isParentField, // Only parent fields can be dragged
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Only allow parent fields to receive drops
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.FIELD,
    canDrop: (item) => {
      // Only parent fields can receive drops and
      // prevent dropping on itself or its children
      return isParentField && item.id !== id && !isChildOf(item.id, field);
    },
    drop: (item) => {
      // Handle the drop action
      if (item.id !== id) {
        moveField(item.id, id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Attach both drag and drop refs to the component only if it's a parent
  if (isParentField) {
    drag(drop(ref));
  } else {
    // Only use ref for non-parent fields (not draggable)
    ref.current = ref.current;
  }

  // Helper function to check if a field is a child of another field
  const isChildOf = (fieldId, parentField) => {
    if (!parentField.childSections || parentField.childSections.length === 0) {
      return false;
    }

    return parentField.childSections.some(
      (child) => child.id === fieldId || isChildOf(fieldId, child)
    );
  };

  // Get the display name from the code (simulating translation)
  const getDisplayName = (code) => {
    // This would normally be a lookup to get the translated value
    // For now, just display the code with prettier formatting
    if (!code) return "New Field";
    
    // Convert codes like "en_US" to "English (US)"
    if (code === "en_US") return "English (US)";
    if (code === "fr_FR") return "French (France)";
    if (code === "es_ES") return "Spanish (Spain)";
    
    // For other codes, just make it look nicer
    return code.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Styling for different field types
  const getCardStyle = (isParentField) => {
    return {
      backgroundColor: isParentField ? "#f8f9fa" : "white",
      border: isParentField ? "1px solid #0d6efd" : "1px solid #dee2e6",
      boxShadow: isParentField
        ? "0 0 10px rgba(13, 110, 253, 0.1)"
        : "0 2px 4px rgba(0, 0, 0, 0.1)",
      borderLeft: isParentField ? "5px solid #0d6efd" : "1px solid #dee2e6",
    };
  };

  const marginLeft = level * 20; // Indentation based on nesting level
  // Get opacity value from isDragging
  const opacityValue = isDragging ? 0.5 : 1;

  return (
    <div
      ref={ref}
      style={{
        marginLeft,
        marginBottom: "8px",
      }}
    >
      <Card
        style={{
          ...getCardStyle(isParentField),
          opacity: opacityValue,
          borderStyle: isOver && canDrop ? "2px dashed #4682b4" : undefined,
          cursor: isParentField ? "move" : "default",
        }}
      >
        <Card.Header className={isParentField ? "bg-light" : ""}>
          <Row>
            <Col md={6}>
              <div
                style={{
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {isParentField && (
                  <Badge bg="primary" className="me-2">
                    Parent
                  </Badge>
                )}
                {getDisplayName(field.values?.code)}
                {field.values?.fieldCode && ` - ${getDisplayName(field.values.fieldCode)}`}
              </div>
              <div className="text-muted small">
                Type: {field.values?.fieldType || "Not Set"}
                {field.values?.pageTitle && (
                  <div>Page Title: {field.values.pageTitle}</div>
                )}
              </div>
            </Col>
            <Col md={6} className="text-end">
              <ButtonGroup size="sm" className="me-2">
                <Button
                  variant="outline-secondary"
                  onClick={() => onMoveUp(id)}
                  title="Move Up"
                >
                  ↑
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => onMoveDown(id)}
                  title="Move Down"
                >
                  ↓
                </Button>
              </ButtonGroup>

              <Button
                variant="outline-primary"
                size="sm"
                className="me-1"
                onClick={() => onEdit(id)}
                title="Edit Field"
              >
                Edit
              </Button>

              {onClone && (
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="me-1"
                  onClick={() => onClone(id)}
                  title="Clone this field and all its children"
                >
                  Clone
                </Button>
              )}

              {isParentField ? (
                // For parent fields - show buttons to add fields and child parents
                <ButtonGroup size="sm" className="me-1">
                  <Button
                    variant="outline-success"
                    onClick={() => onAddChild(id)}
                    title="Add Child Field"
                  >
                    + Field
                  </Button>
                  <Button
                    variant="outline-info"
                    onClick={() => onAddChildParent(id)}
                    title="Add Child Parent"
                  >
                    + Parent
                  </Button>
                </ButtonGroup>
              ) : (
                // For child fields - only add sibling if the function is provided
                onAddSibling && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-1"
                    onClick={() => onAddSibling(parentId, field.values?.fieldType)}
                    title="Add Sibling Field"
                  >
                    + Field
                  </Button>
                )
              )}

              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(id)}
                title="Delete Field"
              >
                Delete
              </Button>

              {field.childSections && field.childSections.length > 0 && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="ms-2"
                  onClick={() => toggleExpand(id)}
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? "▼" : "►"}
                </Button>
              )}
            </Col>
          </Row>
        </Card.Header>
        {isExpanded &&
          field.childSections &&
          field.childSections.length > 0 && (
            <Card.Body className="pt-2 pb-2">
              <div className="nested-fields">
                {/* Child fields will be rendered by the parent component */}
              </div>
            </Card.Body>
          )}
      </Card>
    </div>
  );
};

export default DraggableField;