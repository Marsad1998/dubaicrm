// import { useState, useEffect } from 'react';
// import apiClient from '../utils/apiClient';
// import { getBaseUrl } from '../components/BaseUrl';
// import Toast from '../services/toast';

// const endpoints = {
//     templates: `${getBaseUrl()}/whatsapp/show`,
//     templatePreview: (sid: string) => `${getBaseUrl()}/whatsapp/templates/${sid}/preview`,
// };

// interface UseTemplatesOptions {
//   params?: Record<string, any>;
// }

// export const useTemplates = (options: UseTemplatesOptions = {}) => {
//   const [templates, setTemplates] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<any>(null);
//   const [preview, setPreview] = useState<any>('');
//   const [previewLoading, setPreviewLoading] = useState(false);
//   const toast = Toast();

//   useEffect(() => {
//     const fetchTemplates = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const tRes = await apiClient.get(endpoints.templates, { 
//           params: { page: 1, per_page: 100, ...options.params } 
//         });
//         setTemplates(Array.isArray(tRes.data?.data) ? tRes.data.data : []);
//       } catch (err: any) {
//         setError(err);
//         toast.error('Failed to load templates');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTemplates();
//   }, [options.params]); 

//   return { templates, loading, error };
// };




import { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/apiClient';
import { getBaseUrl } from '../components/BaseUrl';
import Toast from '../services/toast';

const endpoints = {
    templates: `${getBaseUrl()}/whatsapp/show`,
    templatePreview: (sid: string) =>
        `${getBaseUrl()}/whatsapp/templates/${sid}/preview`,
};

interface UseTemplatesOptions {
    params?: Record<string, any>;
}

export const useTemplates = (options: UseTemplatesOptions = {}) => {
    const toast = Toast();

    const [templates, setTemplates] = useState<any[]>([]);
    const [loadingg, setLoadingg] = useState(true);
    const [error, setError] = useState<any>(null);

    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

    const [preview, setPreview] = useState<any>('');
    const [previewLoading, setPreviewLoading] = useState(false);

    // Load templates
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoadingg(true);
                setError(null);

                const tRes = await apiClient.get(endpoints.templates, {
                    params: { page: 1, per_page: 100, ...options.params },
                });

                setTemplates(Array.isArray(tRes.data?.data) ? tRes.data.data : []);
            } catch (err: any) {
                setError(err);
                toast.error('Failed to load templates');
            } finally {
                setLoadingg(false);
            }
        };

        fetchTemplates();
    }, [options.params]);

    const selectedTemplate = templates.find(
        (t: any) => t.id === selectedTemplateId
    );

    // Load preview when template changes
    useEffect(() => {
        const fetchPreview = async () => {
            if (!selectedTemplate?.sid) {
                setPreview('');
                return;
            }

            try {
                setPreviewLoading(true);
                const res = await apiClient.get(
                    endpoints.templatePreview(selectedTemplate.sid)
                );

                setPreview(res.data?.preview || selectedTemplate.sample_text || '');
            } catch {
                setPreview(selectedTemplate?.sample_text || '');
            } finally {
                setPreviewLoading(false);
            }
        };

        fetchPreview();
    }, [selectedTemplateId]);

    return {
        templates,
        loadingg,
        error,
        selectedTemplateId,
        setSelectedTemplateId,
        selectedTemplate,
        preview,
        previewLoading,
    };
};