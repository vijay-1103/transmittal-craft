const API_BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export interface DocumentItem {
  document_no: string;
  title: string;
  revision: number;
  copies: number;
  action: string;
}

export interface TransmittalCreate {
  transmittal_type: string;
  department: string;
  design_stage?: string;
  transmittal_date: string;
  send_to: string;
  salutation: string;
  recipient_name: string;
  sender_name: string;
  sender_designation: string;
  send_mode: string;
  documents: DocumentItem[];
  title: string;
  project_name?: string;
  purpose?: string;
  remarks?: string;
}

export interface Transmittal extends TransmittalCreate {
  id: string;
  transmittal_number?: string;
  status: string;
  document_count: number;
  created_date: string;
  generated_date?: string;
  send_details?: {
    delivery_person?: string;
    send_date?: string;
  };
  receive_details?: {
    receipt_file?: string;
    received_date?: string;
    received_time?: string;
  };
  sent_status?: string;
  received_status?: string;
}

export const transmittalApi = {
  // Get all transmittals with pagination and filtering
  async getTransmittals(params?: {
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<Transmittal[]> {
    const queryParams = new URLSearchParams();
    if (params?.status && params.status !== 'all') {
      queryParams.append('status', params.status);
    }
    if (params?.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/transmittals?${queryParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch transmittals: ${response.statusText}`);
    }
    return response.json();
  },

  // Get transmittals count
  async getTransmittalsCount(status?: string): Promise<{ count: number }> {
    const queryParams = new URLSearchParams();
    if (status && status !== 'all') {
      queryParams.append('status', status);
    }

    const response = await fetch(`${API_BASE_URL}/api/transmittals/count?${queryParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch count: ${response.statusText}`);
    }
    return response.json();
  },

  // Get single transmittal
  async getTransmittal(id: string): Promise<Transmittal> {
    const response = await fetch(`${API_BASE_URL}/api/transmittals/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch transmittal: ${response.statusText}`);
    }
    return response.json();
  },

  // Create new transmittal
  async createTransmittal(data: TransmittalCreate): Promise<Transmittal> {
    const response = await fetch(`${API_BASE_URL}/api/transmittals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create transmittal: ${response.statusText}`);
    }
    return response.json();
  },

  // Update transmittal
  async updateTransmittal(id: string, data: Partial<TransmittalCreate>): Promise<Transmittal> {
    const response = await fetch(`${API_BASE_URL}/api/transmittals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update transmittal: ${response.statusText}`);
    }
    return response.json();
  },

  // Delete transmittal
  async deleteTransmittal(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/transmittals/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete transmittal: ${response.statusText}`);
    }
  },

  // Generate transmittal
  async generateTransmittal(id: string): Promise<Transmittal> {
    const response = await fetch(`${API_BASE_URL}/api/transmittals/${id}/generate`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to generate transmittal: ${response.statusText}`);
    }
    return response.json();
  },

  // Duplicate transmittal
  async duplicateTransmittal(id: string, mode: 'opposite' | 'same' = 'opposite'): Promise<Transmittal> {
    const response = await fetch(`${API_BASE_URL}/api/transmittals/${id}/duplicate?mode=${mode}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to duplicate transmittal: ${response.statusText}`);
    }
    return response.json();
  },

  // Update send status
  async updateSendStatus(id: string, sendDetails: any, sentStatus: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/transmittals/${id}/send?sent_status=${sentStatus}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendDetails),
    });
    if (!response.ok) {
      throw new Error(`Failed to update send status: ${response.statusText}`);
    }
  },

  // Update receive status
  async updateReceiveStatus(id: string, receiveDetails: any, receivedStatus: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/transmittals/${id}/receive?received_status=${receivedStatus}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(receiveDetails),
    });
    if (!response.ok) {
      throw new Error(`Failed to update receive status: ${response.statusText}`);
    }
  },

  // Upload receipt file
  async uploadReceipt(file: File): Promise<{ filename: string; content_type: string; base64_content: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/transmittals/upload-receipt`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Failed to upload receipt: ${response.statusText}`);
    }
    return response.json();
  },
};