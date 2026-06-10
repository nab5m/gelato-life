// 플라트라이프 계약(contract) API 호출 (서버 전용)
import { partnerRequest } from "./client";

// 계약 생성. body: OpenContractCreateRequest. 201 응답(OpenContractDetailResponse) 반환.
export async function createContract(body) {
  return partnerRequest("/open/v1/contract", { method: "POST", body });
}

// 계약 수정(전체 덮어쓰기). body: OpenContractUpdateRequest.
export async function updateContract(contractId, body) {
  return partnerRequest(`/open/v1/contract/${contractId}`, { method: "PUT", body });
}

// 내부 식별자(id)로 계약 상세 조회.
export async function getContract(id) {
  return partnerRequest(`/open/v1/contract/${id}`, { method: "GET" });
}

// 외부 식별자(externalId)로 계약 조회.
export async function getContractByExternalId(externalId) {
  return partnerRequest("/open/v1/contract", { method: "GET", params: { externalId } });
}

// 계약 채널 목록 (PUBLIC + 인증된 PRIVATE).
export async function listContractChannels() {
  return partnerRequest("/open/v1/contract-channel", { method: "GET" });
}
