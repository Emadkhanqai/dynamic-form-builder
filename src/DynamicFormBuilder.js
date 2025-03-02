import React, { useState } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { v4 as uuidv4 } from "uuid";

const ItemType = "FORM_FIELD";

const DraggableField = ({ field, index, moveField, removeField, updateField, addChild, moveUp, moveDown, parentIndex = null }) => {
  const [{ isDragging }, ref] = useDrag({
    type: ItemType,
    item: { index, parentIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index || draggedItem.parentIndex !== parentIndex) {
        moveField(draggedItem.index, index, draggedItem.parentIndex, parentIndex);
        draggedItem.index = index;
        draggedItem.parentIndex = parentIndex;
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      className={`mb-2 p-2 border rounded bg-light ${isDragging ? "opacity-50" : ""}`}
    >
      <Form.Group>
        <Form.Label>Code</Form.Label>
        <Form.Control
          type="text"
          value={field.Code}
          onChange={(e) => updateField(index, "Code", e.target.value, parentIndex)}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Field Code</Form.Label>
        <Form.Control
          type="text"
          value={field.FieldCode}
          onChange={(e) => updateField(index, "FieldCode", e.target.value, parentIndex)}
        />
      </Form.Group>
      <Button variant="danger" size="sm" className="float-end" onClick={() => removeField(index, parentIndex)}>X</Button>
      <Button variant="success" size="sm" className="me-2" onClick={() => addChild(index, parentIndex)}>+ Child</Button>
      <Button variant="primary" size="sm" className="me-2" onClick={() => moveUp(index, parentIndex)}>↑</Button>
      <Button variant="primary" size="sm" className="me-2" onClick={() => moveDown(index, parentIndex)}>↓</Button>
      <div className="ms-3">
        {field.ChildSections.map((child, childIndex) => (
          <DraggableField
            key={child.id}
            field={child}
            index={childIndex}
            moveField={moveField}
            removeField={removeField}
            updateField={updateField}
            addChild={addChild}
            moveUp={moveUp}
            moveDown={moveDown}
            parentIndex={index}
          />
        ))}
      </div>
    </div>
  );
};

const DynamicFormBuilder = () => {
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({ Code: "", FieldCode: "" });

  const addField = () => {
    if (!newField.Code || !newField.FieldCode) return;
    setFields([...fields, { ...newField, id: uuidv4(), ChildSections: [] }]);
    setNewField({ Code: "", FieldCode: "" });
  };

  const moveField = (fromIndex, toIndex, fromParentIndex = null, toParentIndex = null) => {
    if (fromParentIndex === toParentIndex) {
      const list = fromParentIndex === null ? fields : fields[fromParentIndex].ChildSections;
      const updatedList = [...list];
      const [movedItem] = updatedList.splice(fromIndex, 1);
      updatedList.splice(toIndex, 0, movedItem);
      if (fromParentIndex === null) setFields(updatedList);
      else {
        const updatedFields = [...fields];
        updatedFields[fromParentIndex].ChildSections = updatedList;
        setFields(updatedFields);
      }
    }
  };

  const moveUp = (index, parentIndex = null) => {
    if (index === 0) return;
    moveField(index, index - 1, parentIndex, parentIndex);
  };

  const moveDown = (index, parentIndex = null) => {
    const list = parentIndex === null ? fields : fields[parentIndex].ChildSections;
    if (index === list.length - 1) return;
    moveField(index, index + 1, parentIndex, parentIndex);
  };

  const removeField = (index, parentIndex = null) => {
    if (parentIndex === null) setFields(fields.filter((_, i) => i !== index));
    else {
      const updatedFields = [...fields];
      updatedFields[parentIndex].ChildSections = updatedFields[parentIndex].ChildSections.filter((_, i) => i !== index);
      setFields(updatedFields);
    }
  };

  const updateField = (index, key, value, parentIndex = null) => {
    const updatedFields = [...fields];
    if (parentIndex === null) updatedFields[index][key] = value;
    else updatedFields[parentIndex].ChildSections[index][key] = value;
    setFields(updatedFields);
  };

  const addChild = (index, parentIndex = null) => {
    const updatedFields = [...fields];
    const newChild = { Code: "", FieldCode: "", id: uuidv4(), ChildSections: [] };
    if (parentIndex === null) updatedFields[index].ChildSections.push(newChild);
    else updatedFields[parentIndex].ChildSections[index].ChildSections.push(newChild);
    setFields(updatedFields);
  };

  const submitForm = async () => {
    const response = await fetch("/api/formConfiguration/CreateUserInterfaceForDynamicForm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = await response.json();
    console.log("Response:", data);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Container className="mt-4">
        <Card className="p-4">
          <h3>Dynamic Form Builder</h3>
          <Form>
            <Button onClick={addField} className="mt-2">Add Parent</Button>
          </Form>
          <div className="mt-3">
            {fields.map((field, index) => (
              <DraggableField
                key={field.id}
                field={field}
                index={index}
                moveField={moveField}
                removeField={removeField}
                updateField={updateField}
                addChild={addChild}
                moveUp={moveUp}
                moveDown={moveDown}
              />
            ))}
          </div>
          <Button onClick={submitForm} className="mt-3">Submit Form</Button>
        </Card>
      </Container>
    </DndProvider>
  );
};

export default DynamicFormBuilder;
