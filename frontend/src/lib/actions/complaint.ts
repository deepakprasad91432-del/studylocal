'use server';

import { api } from '@/lib/api-client';

export async function submitSupportRequest(type: string, description: string) {
    try {
        const payload = {
            type, // feedback, issue, complaint
            description,
            reason: `Dashboard Support: ${type.toUpperCase()}`
        };

        const res = await api.post('/complaint/', payload);
        return res;
    } catch (error: any) {
        console.error('[Support Action] Submission Error:', error);
        return { success: false, message: error.message || 'Failed to submit request.' };
    }
}


export async function submitComplaint(_prevState: any, formData: FormData) {
    try {
        const type = formData.get('type') as string;
        const description = formData.get('description') as string;
        const contact = formData.get('contact') as string;

        if (!type || !description) {
            return { success: false, message: 'Type and description are required.' };
        }

        const payload = {
            type,
            description,
            reason: contact ? `Contact: ${contact}` : `Complaint: ${type}`,
        };

        const res = await api.post('/complaint/', payload);
        return { success: true, message: res?.message || 'Your complaint has been submitted. We\'ll review it shortly.' };
    } catch (error: any) {
        console.error('[Complaint Action] Submission Error:', error);
        return { success: false, message: error.message || 'Failed to submit complaint.' };
    }
}
