// src/utils/fieldTypes.js
export const FIELD_TYPES = {
  DROPDOWN: 'Dropdown',
  TEXTBOX: 'Textbox',
  CHECKBOX: 'Checkbox',
  DRAGGABLE: 'Draggable / Draggable + Nesting',
  STRING: 'String input'
};

export const FIELD_DEFINITIONS = [
  {
    id: 'code',
    label: 'Code',
    jsonProperty: 'Code',
    type: FIELD_TYPES.DROPDOWN,
    description: 'Value must be taken from global localization lookup.',
    dataSource: 'Global Localization (Lookup)',
    required: true
  },
  {
    id: 'entity',
    label: 'Entity',
    jsonProperty: 'Entity',
    type: FIELD_TYPES.DROPDOWN,
    description: 'This will load tables for selection',
    dataSource: 'Entities (Lookup)',
    required: false
  },
  {
    id: 'fieldCode',
    label: 'Field',
    jsonProperty: 'FieldCode',
    type: FIELD_TYPES.DROPDOWN,
    description: 'Represents the column name; selected from dropdown after choosing an entity.',
    dataSource: 'Entity Selection (Lookup) + Column Selection (Lookup)',
    required: false,
    conditionalRequired: "field type is not header/accordion"
  },
  {
    id: 'sortOrder',
    label: 'Sort Order',
    jsonProperty: 'SortOrder',
    type: FIELD_TYPES.DRAGGABLE,
    description: 'Determines order; should be draggable.',
    dataSource: '',
    required: false
  },
  {
    id: 'fieldType',
    label: 'Field Type',
    jsonProperty: 'FieldTypeId',
    type: FIELD_TYPES.DROPDOWN,
    description: 'Field type selected from lookup.',
    dataSource: 'Field Type (Lookup)',
    required: true
  },
  {
    id: 'customValidation',
    label: 'Custom Validation',
    jsonProperty: 'CustomValidationId',
    type: FIELD_TYPES.DROPDOWN,
    description: 'Validation selected from lookup.',
    dataSource: 'Custom Validation (Lookup)',
    required: false
  },
  {
    id: 'placeholder',
    label: 'Placeholder',
    jsonProperty: 'Placeholder',
    type: FIELD_TYPES.TEXTBOX,
    description: 'Textbox input for placeholder text.',
    dataSource: '',
    required: false
  },
  {
    id: 'question',
    label: 'Question',
    jsonProperty: 'QuestionId',
    type: FIELD_TYPES.DROPDOWN,
    description: 'Question selected from lookup and mapped.',
    dataSource: 'Questions (Lookup)',
    required: false
  },
  {
    id: 'lookupSourceMapping',
    label: 'Lookup Source Mapping',
    jsonProperty: 'LookupSourceMappingId',
    type: FIELD_TYPES.DROPDOWN,
    description: 'Selected from lookup and mapped.',
    dataSource: 'Lookup (Lookup Source Mapping)',
    required: false
  },
  {
    id: 'DisplayWorkflowGroup',
    label: 'Display Workflow Group',
    jsonProperty: 'DisplayWorkflowGroupId',
    type: FIELD_TYPES.DROPDOWN,
    description: 'Selected from lookup and mapped.',
    dataSource: 'Lookup (Workflow Group)',
    required: false
  },
  {
    id: 'isRtl',
    label: 'IsRTL',
    jsonProperty: 'IsRtl',
    type: FIELD_TYPES.CHECKBOX,
    description: 'Boolean, default is FALSE',
    dataSource: '',
    required: false
  },
  {
    id: 'helperTextCode',
    label: 'Helper Text Code',
    jsonProperty: 'HelperTextCode',
    type: FIELD_TYPES.DROPDOWN,
    description: 'Taken from global localization lookup.',
    dataSource: 'Global Localization (Lookup)',
    required: false
  },
  {
    id: 'guideUrl',
    label: 'Guide Url',
    jsonProperty: 'GuideUrl',
    type: FIELD_TYPES.TEXTBOX,
    description: 'Textbox input for URL',
    dataSource: '',
    required: false
  },
  {
    id: 'guideUrlMode',
    label: 'Guide Url Mode',
    jsonProperty: 'GuideUrlMode',
    type: FIELD_TYPES.DROPDOWN,
    description: 'Dropdown (internal/external). Becomes required if GuideUrl is provided.',
    dataSource: 'Dropdown Selection Hardcoded',
    required: false,
    conditionalRequired: "GuideUrl provided"
  },
  {
    id: 'guideUrlType',
    label: 'Guide Url Type',
    jsonProperty: 'GuideUrlType',
    type: FIELD_TYPES.DROPDOWN,
    description: 'Dropdown (text/link/etc.). Becomes required if GuideUrl is provided.',
    dataSource: 'Dropdown Selection Hardcoded',
    required: false,
    conditionalRequired: "GuideUrl provided"
  },
  {
    id: 'enabled',
    label: 'Enabled',
    jsonProperty: 'Enabled',
    type: FIELD_TYPES.CHECKBOX,
    description: 'Checkbox input.',
    dataSource: '',
    required: false
  },
  {
    id: 'display',
    label: 'Display',
    jsonProperty: 'Display',
    type: FIELD_TYPES.CHECKBOX,
    description: 'Checkbox input.',
    dataSource: '',
    required: false
  },
  {
    id: 'required',
    label: 'Required',
    jsonProperty: 'Required',
    type: FIELD_TYPES.CHECKBOX,
    description: 'Checkbox input.',
    dataSource: '',
    required: false
  },
  {
    id: 'versionId',
    label: 'VersionId',
    jsonProperty: 'VersionId',
    type: FIELD_TYPES.DROPDOWN,
    description: 'Selected from version repository.',
    dataSource: 'Version (Lookup)',
    required: false
  },
  {
    id: 'canTriggerWorkflow',
    label: 'Can Trigger Workflow',
    jsonProperty: 'CanTriggerWorkflow',
    type: FIELD_TYPES.CHECKBOX,
    description: 'Checkbox input, default is FALSE',
    dataSource: '',
    required: false
  },
  {
    id: 'displayWorkflowGroup',
    label: 'Display Workflow Group',
    jsonProperty: 'DisplayWorkflowGroupId',
    type: FIELD_TYPES.DROPDOWN,
    description: 'Selected from lookup; validation: only if CanTriggerWorkflow is TRUE.',
    dataSource: 'Workflow Group (Lookup)',
    required: false,
    conditionalVisibility: "canTriggerWorkflow === true"
  },
  {
    id: 'isDynamicQuestion',
    label: 'Is Dynamic Question',
    jsonProperty: 'IsDynamicQuestion',
    type: FIELD_TYPES.CHECKBOX,
    description: 'Checkbox input, default is FALSE',
    dataSource: '',
    required: false
  },
  {
    id: 'pageTitle',
    label: 'Page Title',
    jsonProperty: 'PageTitle',
    type: FIELD_TYPES.TEXTBOX,
    description: 'String input',
    dataSource: '',
    required: false
  },
  {
    id: 'pageButtonTitle',
    label: 'Page Button Title',
    jsonProperty: 'PageButtonTitle',
    type: FIELD_TYPES.TEXTBOX,
    description: 'String input',
    dataSource: '',
    required: false
  },
  {
    id: 'allowSubmission',
    label: 'Allow Submission',
    jsonProperty: 'AllowSubmission',
    type: FIELD_TYPES.CHECKBOX,
    description: 'Checkbox input, default is FALSE',
    dataSource: '',
    required: false
  },
  {
    id: 'pageBreak',
    label: 'Page Break',
    jsonProperty: 'PageBreak',
    type: FIELD_TYPES.CHECKBOX,
    description: 'Checkbox input, default is FALSE',
    dataSource: '',
    required: false
  },
  {
    id: 'dropdownDependency',
    label: 'Dropdown Dependency',
    jsonProperty: 'DropdownDependencyId',
    type: FIELD_TYPES.DROPDOWN,
    description: 'Selected from lookup and mapped.',
    dataSource: 'Dropdown Dependency (Lookup)',
    required: false
  },
  {
    id: 'defaultValue',
    label: 'Default Value',
    jsonProperty: 'DefaultValue',
    type: FIELD_TYPES.TEXTBOX,
    description: 'Textbox input',
    dataSource: '',
    required: false
  }
];

// Group definitions for UI display
export const FIELD_GROUPS = [
  {
    name: 'Basic Information',
    fields: ['code', 'entity', 'fieldCode', 'sortOrder', 'fieldType', 'lookupSourceMapping' ,'defaultValue']
  },
  {
    name: 'Validation',
    fields: ['customValidation']
  },
  {
    name: 'UI Elements',
    fields: ['placeholder', 'guideUrl', 'guideUrlMode', 'guideUrlType', 'helperTextCode', 'isRtl', 'display', 'enabled', 'required']
  },
  {
    name: 'Question Settings',
    fields: ['question', 'isDynamicQuestion']
  },
  {
    name: 'Workflow',
    fields: ['canTriggerWorkflow', 'displayWorkflowGroup']
  },
  
  {
    name: 'Advanced',
    fields: ['versionId', 'dropdownDependency']
  }
];

// Helper function to get default values for a new field
export const getDefaultFieldValues = () => {
  const defaultValues = {};
  
  FIELD_DEFINITIONS.forEach(field => {
    if (field.type === FIELD_TYPES.CHECKBOX) {
      defaultValues[field.id] = false;
    } else if (field.required) {
      defaultValues[field.id] = "";
    } else {
      defaultValues[field.id] = null;
    }
  });
  
  return defaultValues;
};

// Helper function to validate field values
export const validateField = (field, value, formValues) => {
  const fieldDef = FIELD_DEFINITIONS.find(f => f.id === field);
  
  if (!fieldDef) return true;
  
  // Helper function to check if value is empty
  const isEmpty = (val) => {
    return val === "" || val === null || val === undefined;
  };
  
  // Only Code and Field Type are required
  if ((field === 'code' || field === 'fieldType') && isEmpty(value)) {
    return false;
  }
  
  // Handle conditional requirements
  if (fieldDef.conditionalRequired) {
    if (fieldDef.conditionalRequired === "GuideUrl provided") {
      // If GuideUrl is provided, this field is required
      if (!isEmpty(formValues.guideUrl) && isEmpty(value)) {
        return false;
      }
    }
    else if (fieldDef.conditionalRequired === "field type is not header/accordion") {
      // Check if fieldType is not header or accordion
      const isHeaderOrAccordion = 
        formValues.fieldType === "header" || 
        formValues.fieldType === "accordion";
      
      // If not header/accordion and value is empty, validation fails
      if (!isHeaderOrAccordion && fieldDef.required && isEmpty(value)) {
        return false;
      }
    }
  }
  
  return true;
};