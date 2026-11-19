import { apiInstance } from './apiClient';

export const getTemplates = () => apiInstance.get('/designs/templates');
export const getSavedDesigns = () => apiInstance.get('/designs');
export const saveDesign = (design) => apiInstance.post('/designs', design);
export const validateDesign = (design) => apiInstance.post('/designs/validate', design);
