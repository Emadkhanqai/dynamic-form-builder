// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Mock data for development purposes
const mockLookupData = {
  'Global Localization (Lookup)': [
    { id: 'en_US', name: 'English (US)' },
    { id: 'es_ES', name: 'Spanish (Spain)' },
    { id: 'fr_FR', name: 'French (France)' }
  ],
  'Entities (Lookup)': [
    { id: 'customers', name: 'Customers' },
    { id: 'products', name: 'Products' },
    { id: 'orders', name: 'Orders' }
  ],
  'Field Type (Lookup)': [
    { id: 'text', name: 'Text' },
    { id: 'number', name: 'Number' },
    { id: 'date', name: 'Date' },
    { id: 'dropdown', name: 'Dropdown' },
    { id: 'checkbox', name: 'Checkbox' },
    { id: 'radio', name: 'Radio' },
    { id: 'header', name: 'Header' },
    { id: 'accordion', name: 'Accordion' }
  ],
  'Custom Validation (Lookup)': [
    { id: 'email', name: 'Email' },
    { id: 'phone', name: 'Phone' },
    { id: 'url', name: 'URL' },
    { id: 'alphanumeric', name: 'Alphanumeric' }
  ],
  'Questions (Lookup)': [
    { id: 'q1', name: 'Personal Information' },
    { id: 'q2', name: 'Contact Details' },
    { id: 'q3', name: 'Address Information' }
  ],
  'Lookup (Lookup Source Mapping)': [
    { id: 'lsm1', name: 'Countries' },
    { id: 'lsm2', name: 'States' },
    { id: 'lsm3', name: 'Cities' }
  ],
  'Version (Lookup)': [
    { id: 'v1', name: 'Version 1.0' },
    { id: 'v2', name: 'Version 2.0' },
    { id: 'v3', name: 'Version 3.0' }
  ],
  'Workflow Group (Lookup)': [
    { id: 'wg1', name: 'Approval' },
    { id: 'wg2', name: 'Notification' },
    { id: 'wg3', name: 'Integration' }
  ],
  'Dropdown Dependency (Lookup)': [
    { id: 'dd1', name: 'Country-State' },
    { id: 'dd2', name: 'State-City' },
    { id: 'dd3', name: 'Category-Subcategory' }
  ],
  'Dropdown Selection Hardcoded': [
    { id: 'internal', name: 'Internal' },
    { id: 'external', name: 'External' },
    { id: 'text', name: 'Text' },
    { id: 'link', name: 'Link' },
    { id: 'image', name: 'Image' }
  ]
};

// Entity-specific columns
const entityColumns = {
  'customers': [
    { id: 'name', name: 'Name' },
    { id: 'email', name: 'Email' },
    { id: 'phone', name: 'Phone' }
  ],
  'products': [
    { id: 'name', name: 'Name' },
    { id: 'price', name: 'Price' },
    { id: 'category', name: 'Category' }
  ],
  'orders': [
    { id: 'orderId', name: 'Order ID' },
    { id: 'customer', name: 'Customer' },
    { id: 'amount', name: 'Amount' }
  ]
};

// Mock API calls for development
const mockGetLookupData = (lookupType) => {
  return Promise.resolve(mockLookupData[lookupType] || []);
};

const mockGetEntityColumns = (entityId) => {
  return Promise.resolve(entityColumns[entityId] || []);
};

// Actual API calls
const getLookupData = async (lookupType) => {
  // In development, use mock data
  if (process.env.NODE_ENV === 'development') {
    return mockGetLookupData(lookupType);
  }
  
  try {
    const response = await apiClient.get(`/lookups/${lookupType}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lookup data:', error);
    throw error;
  }
};

const getEntityColumns = async (entityId) => {
  // In development, use mock data
  if (process.env.NODE_ENV === 'development') {
    return mockGetEntityColumns(entityId);
  }
  
  try {
    const response = await apiClient.get(`/entities/${entityId}/columns`);
    return response.data;
  } catch (error) {
    console.error('Error fetching entity columns:', error);
    throw error;
  }
};

const getDynamicForm = async () => {
  try {
    const response = await apiClient.get('/formConfiguration/GetDynamicForm');
    return response.data;
  } catch (error) {
    console.error('Error fetching dynamic form:', error);
    throw error;
  }
};

const createDynamicForm = async (formData) => {
  try {
    const response = await apiClient.post('/formConfiguration/CreateUserInterfaceForDynamicForm', formData);
    return response.data;
  } catch (error) {
    console.error('Error creating dynamic form:', error);
    throw error;
  }
};

export default {
  getLookupData,
  getEntityColumns,
  getDynamicForm,
  createDynamicForm
};