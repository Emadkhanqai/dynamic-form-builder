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
}) => {
  const ref = useRef(null);

  // Implement drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.FIELD,
    item: { id, index, level },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Implement drop functionality
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.FIELD,
    canDrop: (item) => {
      // Prevent dropping on itself or its children
      return item.id !== id && !isChildOf(item.id, field);
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

  // Attach both drag and drop refs to the component
  drag(drop(ref));

  // Helper function to check if a field is a child of another field
  const isChildOf = (fieldId, parentField) => {
    if (!parentField.childSections || parentField.childSections.length === 0) {
      return false;
    }

    return parentField.childSections.some(
      (child) => child.id === fieldId || isChildOf(fieldId, child)
    );
  };

  // Determine if this is a parent field (header or accordion)
  const isParentField =
    field.values?.fieldType === "header" ||
    field.values?.fieldType === "accordion";

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
          opacity: opacityValue, // Fixed: use opacityValue instead of undefined opacity
          borderStyle: isOver && canDrop ? "2px dashed #4682b4" : undefined,
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
                {field.values?.code || "New Field"}
                {field.values?.fieldCode && ` - ${field.values.fieldCode}`}
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

              <ButtonGroup size="sm" className="me-1">
                <Button
                  variant={isParentField ? "outline-info" : "outline-success"}
                  onClick={() => onAddChild(id)}
                  title="Add Child Field"
                >
                  + Field
                </Button>
                {isParentField && (
                  <Button
                    variant="outline-info"
                    onClick={() => onAddChildParent(id)}
                    title="Add Child Parent"
                  >
                    + Parent
                  </Button>
                )}
              </ButtonGroup>

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