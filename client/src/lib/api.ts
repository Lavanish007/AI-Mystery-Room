import {
  CreateCaseInput,
  PublicCaseDto,
  HintResponseDto,
  HintTier,
  RevealResultDto,
  SubmitAnswerInput
} from '@shared';

const API_BASE = '/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    const errorMsg = json?.error?.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    (err as any).status = res.status;
    (err as any).fieldErrors = json?.error?.fieldErrors;
    (err as any).code = json?.error?.code;
    throw err;
  }
  return json.data;
}

export async function createCaseApi(input: CreateCaseInput): Promise<PublicCaseDto> {
  return request<PublicCaseDto>('/cases', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function getCaseApi(caseId: string): Promise<PublicCaseDto> {
  return request<PublicCaseDto>(`/cases/${caseId}`);
}

export async function requestHintApi(caseId: string, level?: HintTier): Promise<HintResponseDto> {
  return request<HintResponseDto>(`/cases/${caseId}/hints`, {
    method: 'POST',
    body: JSON.stringify({ level })
  });
}

export async function submitAnswerApi(caseId: string, input: SubmitAnswerInput): Promise<RevealResultDto> {
  return request<RevealResultDto>(`/cases/${caseId}/answer`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function getResultApi(caseId: string): Promise<RevealResultDto> {
  return request<RevealResultDto>(`/cases/${caseId}/result`);
}
