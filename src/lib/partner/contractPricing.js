// 계약 금액 산정 (플라트라이프 공식). 모든 금액은 KRW 정수, 소수는 HALF_UP(반올림).
// 생성 응답이 권위 있는 최종값이지만, 체크아웃 견적 표시에 동일 공식을 쓴다.

const halfUp = (n) => Math.round(Number(n) || 0); // 양수 금액 기준 HALF_UP

// 시작일·종료일 양 끝 포함 일수. (yyyy-MM-dd 또는 Date)
export function contractDays(startDate, endDate) {
  const a = new Date(startDate);
  const b = new Date(endDate);
  if (isNaN(a) || isNaN(b)) return 0;
  const ms = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
    Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const diff = Math.round(ms / 86400000) + 1; // +1 = 양 끝 포함
  return diff > 0 ? diff : 0;
}

// 할인 규칙: days <= 계약일수 중 할인율(amount,%) 이 가장 큰 규칙
function pickDiscountRate(discountRules, days) {
  const rules = (Array.isArray(discountRules) ? discountRules : []).filter(
    (r) => Number(r?.days) <= days
  );
  if (!rules.length) return 0;
  return rules.reduce((max, r) => Math.max(max, Number(r?.amount) || 0), 0);
}

// 보증금 규칙: days <= 계약일수 중 days 가 가장 큰 규칙의 amount. 없으면 fallback.
function pickDeposit(depositRules, days, fallbackDeposit) {
  const rules = (Array.isArray(depositRules) ? depositRules : [])
    .filter((r) => Number(r?.days) <= days)
    .sort((a, b) => Number(b?.days) - Number(a?.days));
  if (rules.length) return halfUp(rules[0]?.amount);
  return halfUp(fallbackDeposit) || 0;
}

// { days, totalRentFee, discountedRentFee, totalManagementFee, cleaningFee,
//   deposit, commissionFee, usagePrice, totalPrice } 반환
export function computeContractPrice({
  rentFeePerWeek = 0,
  managementFeePerWeek = 0,
  cleaningFee = 0,
  deposit: fallbackDeposit = 0,
  discountRules = [],
  depositRules = [],
  startDate,
  endDate,
}) {
  const days = contractDays(startDate, endDate);

  const totalRentFee = halfUp((Number(rentFeePerWeek) || 0) / 7 * days);
  const rate = pickDiscountRate(discountRules, days);
  const discountedRentFee = halfUp((totalRentFee * rate) / 100);
  const totalManagementFee = halfUp((Number(managementFeePerWeek) || 0) / 7 * days);
  const cFee = halfUp(cleaningFee);
  const deposit = pickDeposit(depositRules, days, fallbackDeposit);

  const usagePrice = totalRentFee - discountedRentFee + totalManagementFee + cFee; // 보증금 제외
  const baseCommissionFee = halfUp(usagePrice * 0.099);
  const totalBeforeRoundDown = halfUp(usagePrice) + baseCommissionFee + halfUp(deposit);
  const commissionFee = baseCommissionFee - (totalBeforeRoundDown % 100); // 100원 단위 내림

  const totalPrice =
    totalRentFee - discountedRentFee + totalManagementFee + cFee + commissionFee + deposit;

  return {
    days,
    totalRentFee,
    discountedRentFee,
    totalManagementFee,
    cleaningFee: cFee,
    deposit,
    commissionFee,
    usagePrice,
    totalPrice,
  };
}
