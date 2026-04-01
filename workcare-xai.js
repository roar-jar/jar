const modeButtons = [...document.querySelectorAll(".mode-card")];
const routeButtons = [...document.querySelectorAll(".route-chip")];
const questionGroupsEl = document.getElementById("question-groups");
const modeTitleEl = document.getElementById("mode-title");
const modeDescriptionEl = document.getElementById("mode-description");
const summaryRouteEl = document.getElementById("summary-route");
const summaryModeEl = document.getElementById("summary-mode");
const summaryStatusEl = document.getElementById("summary-status");
const primaryOutcomeEl = document.getElementById("primary-outcome");
const secondaryOutcomeEl = document.getElementById("secondary-outcome");
const riskScoreEl = document.getElementById("risk-score");
const briefFactsEl = document.getElementById("brief-facts");
const caseBriefEl = document.getElementById("case-brief");
const evidenceProgressTextEl = document.getElementById("evidence-progress-text");
const evidenceProgressFillEl = document.getElementById("evidence-progress-fill");
const evidenceChecklistEl = document.getElementById("evidence-checklist");
const impactListEl = document.getElementById("impact-list");
const priorityListEl = document.getElementById("priority-list");
const evidenceListEl = document.getElementById("evidence-list");
const legalGridEl = document.getElementById("legal-grid");
const legalSourceMetaEl = document.getElementById("legal-source-meta");
const legalSourceSummaryEl = document.getElementById("legal-source-summary");
const legalSourceListEl = document.getElementById("legal-source-list");
const counterfactualListEl = document.getElementById("counterfactual-list");
const caseMemoEl = document.getElementById("case-memo");
const copyMemoButtonEl = document.getElementById("copy-memo-button");

let legalBundles = null;
let legalBundleError = "";

const routes = {
  "transport-entrusted": {
    name: "A3 · 운송·배송 x 위수탁·노무제공",
    status: "배차·정산 통제 검토",
    summary: "배차 통제와 단일 거래처 의존도가 높으면 노무제공자 및 종속성 신호가 올라갑니다.",
    baseRisk: 10,
  },
  "transport-subcontract": {
    name: "A2 · 운송·배송 x 협력사·하청",
    status: "원청·협력사 책임 분리",
    summary: "원청 지시와 협력사 소속이 함께 보이면 실제 통제 주체를 분리해서 봐야 합니다.",
    baseRisk: 8,
  },
  "logistics-subcontract": {
    name: "B2 · 물류·상하차 x 협력사·하청",
    status: "안전·휴게 책임 검토",
    summary: "육체노동 강도와 휴게공간 문제, 하청 안전 책임이 함께 얽히는 셀입니다.",
    baseRisk: 12,
  },
};

const modeConfigs = {
  accident: {
    label: "업무 중 사고 대응",
    description: "사고 직후에 업무 관련성, 안전조치 부족, 책임 주체 후보를 빠르게 분리하는 모드입니다.",
    baseSummary: "산재·보험 검토와 증거 보존의 우선순위를 같이 보여줍니다.",
    groups: [
      {
        title: "사고 상황",
        description: "사고와 업무의 연결 강도를 먼저 잡습니다.",
        fields: [
          {
            id: "accidentContext",
            label: "사고가 난 시점",
            help: "업무 수행, 이동, 대기, 개인 시간 중 어디에 가까운지 고릅니다.",
            options: [
              { value: "task", label: "업무 수행 중", score: 28, note: "주된 업무 중 사고라 업무 관련성 신호가 강합니다." },
              { value: "moving", label: "배차·이동 중", score: 20, note: "이동 경로와 배차 지시가 연결되면 관련성이 높아집니다." },
              { value: "waiting", label: "현장 대기 중", score: 16, note: "대기 구조도 통제에 따라 업무 관련성이 열릴 수 있습니다." },
              { value: "personal", label: "개인 시간", score: 2, note: "개인 시간이라면 업무 관련성 판단이 약해집니다." },
            ],
          },
          {
            id: "instructionProof",
            label: "지시·배차 기록",
            help: "앱 로그, 문자, 메신저, 콜 기록이 있으면 더 좋습니다.",
            options: [
              { value: "clear", label: "명확하게 남아 있음", score: 20, note: "업무 지시와 사고 연결을 입증하기 쉽습니다." },
              { value: "partial", label: "일부만 남아 있음", score: 11, note: "간접 정황은 있으나 보강이 필요합니다." },
              { value: "none", label: "거의 없음", score: 3, note: "기억 진술 외 추가 증빙을 빨리 만들어야 합니다." },
            ],
          },
        ],
      },
      {
        title: "현장 안전",
        description: "안전조치 부족과 휴게환경 문제를 함께 확인합니다.",
        fields: [
          {
            id: "safetyProvision",
            label: "안전장비 제공 상태",
            help: "헬멧, 조끼, 안전화, 차량점검 체계 등을 포함합니다.",
            options: [
              { value: "none", label: "거의 제공되지 않음", score: 18, note: "안전조치 미흡 신호가 큽니다." },
              { value: "partial", label: "일부만 제공됨", score: 9, note: "형식 제공인지 실제 사용 가능한지 봐야 합니다." },
              { value: "enough", label: "충분히 제공됨", score: 2, note: "안전조치 리스크는 일부 완화됩니다." },
            ],
          },
          {
            id: "restFacility",
            label: "휴게공간 접근성",
            help: "쉴 공간과 화장실 접근이 실제로 가능한지 판단합니다.",
            options: [
              { value: "none", label: "거의 없음", score: 16, note: "장시간 현장 작업에서 휴게·안전 리스크가 커집니다." },
              { value: "limited", label: "있지만 불충분함", score: 9, note: "형식적 설치인지 실제 사용 가능한지 따져야 합니다." },
              { value: "good", label: "실제로 사용 가능", score: 2, note: "휴게시설 쟁점 비중은 다소 낮아집니다." },
            ],
          },
        ],
      },
      {
        title: "초기 증빙",
        description: "부상과 사고 시점을 고정하는 자료를 봅니다.",
        fields: [
          {
            id: "medicalVisit",
            label: "병원 진료 기록",
            help: "응급실, 진료확인서, 진단서, 처방전 등을 포함합니다.",
            options: [
              { value: "yes", label: "이미 있음", score: 12, note: "상해 사실과 시점을 고정하는 핵심 증빙입니다." },
              { value: "pending", label: "곧 진료 예정", score: 6, note: "빠르게 의료기록을 남길수록 좋습니다." },
              { value: "no", label: "아직 없음", score: 1, note: "상해 사실 입증이 늦어질 수 있습니다." },
            ],
          },
        ],
      },
    ],
    priorities: [
      "사고 사진, 블랙박스, 앱 로그, 배차 캡처를 먼저 보존하세요.",
      "병원 기록으로 사고 시점과 상해 정도를 고정하세요.",
      "누가 지시했고 어디로 이동 중이었는지 타임라인으로 적으세요.",
    ],
    evidence: [
      "배차내역, 운행기록, 앱 화면, 메신저 지시",
      "사고 사진, 현장 영상, 목격자 연락처",
      "병원 진료확인서, 진단서, 처방전",
      "안전장비 지급 여부를 보여주는 사진 또는 공지",
    ],
    checklist: [
      {
        title: "지시·배차 흔적 확보",
        description: "앱 로그, 메신저, 문자, 콜 배정 기록을 저장합니다.",
      },
      {
        title: "사고 시점 기록",
        description: "현장 사진, 영상, 블랙박스, 목격자 연락처를 남깁니다.",
      },
      {
        title: "상해 기록 고정",
        description: "병원 진료확인서, 진단서, 처방전을 확보합니다.",
      },
      {
        title: "안전조치 여부 정리",
        description: "장비 지급, 휴게공간, 보고 체계 부족 여부를 적어 둡니다.",
      },
    ],
    legal: [
      { title: "업무 관련성", text: "업무 수행, 이동, 대기, 개인 시간 여부에 따라 사고와 업무의 연결 강도가 달라집니다." },
      { title: "안전조치 의무", text: "휴게시설, 안전장비, 보고 체계 부족은 사용자 또는 원청 책임 쟁점으로 이어질 수 있습니다." },
      { title: "노무제공자 보호 검토", text: "위수탁 구조라도 노무제공자 또는 관계수급인 보호 범주가 열리는지 검토해야 합니다." },
    ],
    counterfactuals: [
      "업무 지시 흔적이 더 명확하면 업무 관련성 판단이 더 강해집니다.",
      "휴게공간과 안전장비가 실질적으로 제공됐다면 안전책임 비중이 낮아집니다.",
      "사고가 개인 시간이라는 정황이 강해지면 산재·보험 검토 우선순위는 내려갑니다.",
    ],
  },
  payment: {
    label: "보수·정산 미지급",
    description: "받지 못한 돈의 성격과 지급 통제 구조를 분해해 대응 우선순위를 정리하는 모드입니다.",
    baseSummary: "임금인지 보수인지 정산금인지 나누고, 정산 기준을 누가 통제하는지 함께 봅니다.",
    groups: [
      {
        title: "미지급 금액",
        description: "같은 돈이라도 유형에 따라 출발점이 달라집니다.",
        fields: [
          {
            id: "paymentType",
            label: "받지 못한 돈의 유형",
            help: "월급, 일당, 운임, 수수료 중 어디에 가까운지 고릅니다.",
            options: [
              { value: "salary", label: "월급·고정급", score: 24, note: "임금성 쟁점이 전면으로 올라옵니다." },
              { value: "daily", label: "일당·고정 현장비", score: 18, note: "출역관리와 근로자성 여부가 중요합니다." },
              { value: "fare", label: "운임·정산금", score: 20, note: "정산 규칙과 공제 구조를 먼저 봐야 합니다." },
              { value: "fee", label: "건당 수수료", score: 16, note: "플랫폼·배차 통제와 묶어 봐야 합니다." },
            ],
          },
          {
            id: "delayState",
            label: "미지급 상태",
            help: "전액 미지급인지 일부 공제 분쟁인지 나눕니다.",
            options: [
              { value: "all", label: "전액 미지급", score: 22, note: "지급의무 자체를 다투는 분쟁 강도가 큽니다." },
              { value: "partial", label: "일부만 지급", score: 16, note: "누락 항목과 공제 기준을 쪼개서 봐야 합니다." },
              { value: "deduction", label: "공제 사유 분쟁", score: 18, note: "일방 공제 근거가 핵심 쟁점입니다." },
            ],
          },
        ],
      },
      {
        title: "정산 통제 구조",
        description: "누가 금액을 계산하고 누가 일감을 좌우하는지 봅니다.",
        fields: [
          {
            id: "settlementControl",
            label: "정산 기준 결정권",
            help: "상대방이 일방적으로 정하면 종속성이 강해집니다.",
            options: [
              { value: "principal", label: "상대방이 거의 다 정함", score: 20, note: "정산 구조 통제가 강합니다." },
              { value: "mixed", label: "일부 협의함", score: 10, note: "협의 흔적보다 실제 권한 분포가 중요합니다." },
              { value: "worker", label: "내가 대부분 정함", score: 3, note: "독립성 신호가 더 강해집니다." },
            ],
          },
          {
            id: "singleClient",
            label: "한 업체 의존도",
            help: "하나의 업체에 몰려 있을수록 협상력이 낮아집니다.",
            options: [
              { value: "high", label: "거의 전부 한 업체", score: 17, note: "단일 거래처 의존도가 높습니다." },
              { value: "mid", label: "절반 이상 한 업체", score: 10, note: "부분 의존 상태입니다." },
              { value: "low", label: "여러 업체로 분산", score: 3, note: "독립 사업 신호가 상대적으로 큽니다." },
            ],
          },
        ],
      },
      {
        title: "정산 기록",
        description: "기록이 많을수록 지급주체와 누락 금액을 재구성하기 좋습니다.",
        fields: [
          {
            id: "paymentEvidence",
            label: "정산 기록 상태",
            help: "정산표, 계좌이체, 앱 로그, 공제 내역서를 포함합니다.",
            options: [
              { value: "rich", label: "정산표와 계좌내역이 모두 있음", score: 14, note: "청구 구조를 비교적 명확히 재구성할 수 있습니다." },
              { value: "partial", label: "일부 기록만 있음", score: 8, note: "핵심 날짜와 금액부터 정리해야 합니다." },
              { value: "poor", label: "거의 남아 있지 않음", score: 2, note: "지급 약속과 금액을 다시 복원해야 합니다." },
            ],
          },
        ],
      },
    ],
    priorities: [
      "정산표, 앱 로그, 계좌 입금내역을 한 타임라인으로 묶으세요.",
      "누가 금액을 계산했고 누가 공제했는지 주체를 분리하세요.",
      "전액 미지급인지 일부 공제인지 항목별로 쪼개서 적으세요.",
    ],
    evidence: [
      "정산표, 운행별 수익표, 수수료 계산 내역",
      "계좌이체 내역, 영수증, 정산 캡처",
      "배차내역, 작업완료 로그, 콜 수락 기록",
      "공제 사유 문자, 메신저, 공지문",
    ],
    checklist: [
      {
        title: "정산표와 입금 내역 정리",
        description: "정산표, 계좌 캡처, 날짜별 입금 내역을 모읍니다.",
      },
      {
        title: "누가 금액을 정했는지 표시",
        description: "단가, 공제, 지급일을 누가 정했는지 별도로 적습니다.",
      },
      {
        title: "미지급 항목 분리",
        description: "전액 미지급, 일부 누락, 공제 분쟁을 항목별로 나눕니다.",
      },
      {
        title: "지급 약속 흔적 확보",
        description: "문자, 메신저, 앱 공지, 정산 캡처를 저장합니다.",
      },
    ],
    legal: [
      { title: "임금성 vs 정산금", text: "받지 못한 돈이 임금인지 정산금인지에 따라 법적 출발점이 달라집니다." },
      { title: "정산 통제", text: "상대방이 단가, 공제, 지급일을 통제하면 종속성과 불투명성이 커집니다." },
      { title: "단일 거래처 의존", text: "한 업체 의존도가 높으면 실질 종속성 신호로 읽힐 수 있습니다." },
    ],
    counterfactuals: [
      "복수 거래처로 분산되어 있었다면 독립성 해석이 더 강해집니다.",
      "정산 기준을 본인이 자유롭게 정했다면 종속성 신호가 줄어듭니다.",
      "정산표와 계좌기록이 더 명확할수록 청구 가능한 구조가 선명해집니다.",
    ],
  },
  contract: {
    label: "계약 전 리스크 점검",
    description: "해지, 책임 전가, 정산 불투명 조항을 미리 잡아 분쟁 가능성을 줄이는 모드입니다.",
    baseSummary: "계약서 이름보다 실제 통제와 책임 배분이 중요하다는 전제로 작동합니다.",
    groups: [
      {
        title: "해지와 전속",
        description: "일방 해지와 겸업 제한은 미래 종속성 신호와 연결됩니다.",
        fields: [
          {
            id: "terminationClause",
            label: "일방 해지 조항",
            help: "상대방이 즉시 해지할 수 있는 조항이 넓을수록 리스크가 큽니다.",
            options: [
              { value: "broad", label: "상대방이 넓게 해지 가능", score: 24, note: "미래 분쟁 위험이 가장 큽니다." },
              { value: "limited", label: "일정 사유에만 가능", score: 10, note: "사유의 구체성과 통지 절차를 더 봐야 합니다." },
              { value: "balanced", label: "상호 대칭 구조", score: 3, note: "해지 리스크는 상대적으로 낮습니다." },
            ],
          },
          {
            id: "exclusivity",
            label: "전속 또는 겸업 제한",
            help: "한 업체에만 묶이는지 여부를 봅니다.",
            options: [
              { value: "high", label: "사실상 겸업 불가", score: 16, note: "전속 신호가 강합니다." },
              { value: "medium", label: "일부 제한", score: 9, note: "실제 운영에서 얼마나 엄격한지 추가 확인이 필요합니다." },
              { value: "none", label: "거의 제한 없음", score: 2, note: "독립성 신호가 상대적으로 큽니다." },
            ],
          },
        ],
      },
      {
        title: "책임과 안전",
        description: "사고 책임과 휴게·안전 조항이 비어 있으면 리스크가 커집니다.",
        fields: [
          {
            id: "liabilityShift",
            label: "사고·손해 책임 조항",
            help: "책임이 개인에게 포괄 전가되는지 봅니다.",
            options: [
              { value: "worker", label: "거의 전부 본인 부담", score: 20, note: "책임 전가 위험이 강합니다." },
              { value: "shared", label: "공동 부담 또는 예외 조항 있음", score: 10, note: "예외 조건을 더 구체적으로 봐야 합니다." },
              { value: "balanced", label: "역할별로 비교적 명확", score: 3, note: "책임 구조가 더 균형적입니다." },
            ],
          },
          {
            id: "safetyClause",
            label: "휴게·안전 조항",
            help: "휴게공간, 장비, 보고 절차가 적혀 있는지 봅니다.",
            options: [
              { value: "none", label: "거의 없음", score: 15, note: "현장 안전 리스크가 계약서에 반영되지 않았습니다." },
              { value: "partial", label: "일부만 언급", score: 8, note: "실행 주체와 범위가 빠져 있을 수 있습니다." },
              { value: "clear", label: "구체적으로 명시", score: 2, note: "분쟁 예방 신호가 있습니다." },
            ],
          },
        ],
      },
      {
        title: "정산 투명성",
        description: "정산 기준이 모호하면 미지급·공제 분쟁으로 이어지기 쉽습니다.",
        fields: [
          {
            id: "feeTransparency",
            label: "정산·공제 기준",
            help: "단가, 수수료, 공제 항목, 지급일이 보이는지 봅니다.",
            options: [
              { value: "unclear", label: "거의 안 적혀 있음", score: 19, note: "정산 분쟁으로 이어질 가능성이 큽니다." },
              { value: "medium", label: "일부만 적혀 있음", score: 10, note: "핵심 숫자와 지급일을 보완할 필요가 있습니다." },
              { value: "clear", label: "상당히 명확함", score: 3, note: "정산 리스크가 상대적으로 낮습니다." },
            ],
          },
        ],
      },
    ],
    priorities: [
      "일방 해지, 책임 전가, 정산 불명확 조항을 먼저 표시하세요.",
      "휴게·안전·장비·보고 체계 문구를 추가 요청할지 검토하세요.",
      "겸업 제한과 종속 조항이 실제 운영에 어떤 영향을 주는지 따져보세요.",
    ],
    evidence: [
      "계약서 원문, 별첨 단가표, 공제 기준표",
      "업무 매뉴얼, 운영정책, 앱 이용약관",
      "패널티 규정, 해지 사유표, 책임 범위 문구",
      "휴게·안전·보호장비 제공 기준 문서",
    ],
    checklist: [
      {
        title: "해지 조항 표시",
        description: "상대방이 즉시 해지할 수 있는 문구를 먼저 표시합니다.",
      },
      {
        title: "책임 전가 문구 확인",
        description: "사고·손해 책임이 개인에게 몰리는 조항을 체크합니다.",
      },
      {
        title: "정산 기준 숫자 확인",
        description: "단가, 수수료, 공제, 지급일이 명확히 적혀 있는지 봅니다.",
      },
      {
        title: "휴게·안전 문구 보완",
        description: "장비, 휴게, 보고 체계 문구가 없다면 수정 요청 후보로 적습니다.",
      },
    ],
    legal: [
      { title: "해지 권한 비대칭", text: "상대방 해지 재량이 넓으면 종속성과 분쟁 위험이 함께 올라갑니다." },
      { title: "사고 책임 전가", text: "현장 사고 비용과 손해를 포괄 전가하는 조항은 강한 경고 신호입니다." },
      { title: "정산 불투명", text: "단가와 공제 기준이 애매하면 이후 보수 분쟁의 핵심 원인이 됩니다." },
    ],
    counterfactuals: [
      "해지 사유와 통지 절차가 더 구체적이면 계약 리스크가 낮아집니다.",
      "정산 기준과 공제 항목이 숫자로 명시되면 미지급 분쟁 가능성이 줄어듭니다.",
      "휴게·안전·장비 제공 문구가 들어가면 현장 리스크 평가가 내려갑니다.",
    ],
  },
};

const initialMode = document.body.dataset.mode;
const initialRoute = document.body.dataset.route;

const state = {
  mode: modeConfigs[initialMode] ? initialMode : "accident",
  route: routes[initialRoute] ? initialRoute : "transport-entrusted",
  values: {},
  checks: {},
};

async function loadLegalBundles() {
  try {
    const response = await fetch("./data/workcare-legal-bundles.json", { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    legalBundles = await response.json();
    legalBundleError = "";
  } catch (error) {
    legalBundles = null;
    legalBundleError = error instanceof Error ? error.message : String(error);
  }
}

function initializeValues() {
  Object.entries(modeConfigs).forEach(([modeKey, config]) => {
    state.values[modeKey] = {};
    state.checks[modeKey] = {};
    config.groups.forEach((group) => {
      group.fields.forEach((field) => {
        state.values[modeKey][field.id] = field.options[0].value;
      });
    });
    config.checklist.forEach((_, index) => {
      state.checks[modeKey][index] = false;
    });
  });
}

function getSelectedOption(mode, fieldId) {
  const modeConfig = modeConfigs[mode];
  for (const group of modeConfig.groups) {
    const field = group.fields.find((item) => item.id === fieldId);
    if (field) {
      return field.options.find((option) => option.value === state.values[mode][fieldId]);
    }
  }
  return null;
}

function renderQuestionGroups() {
  const modeConfig = modeConfigs[state.mode];
  modeTitleEl.textContent = modeConfig.label;
  modeDescriptionEl.textContent = modeConfig.description;
  questionGroupsEl.innerHTML = "";

  modeConfig.groups.forEach((group) => {
    const cardEl = document.createElement("article");
    cardEl.className = "question-card";

    const titleEl = document.createElement("h3");
    titleEl.textContent = group.title;
    cardEl.appendChild(titleEl);

    const descriptionEl = document.createElement("p");
    descriptionEl.className = "body-copy";
    descriptionEl.textContent = group.description;
    cardEl.appendChild(descriptionEl);

    const fieldListEl = document.createElement("div");
    fieldListEl.className = "field-list";

    group.fields.forEach((field) => {
      const fieldEl = document.createElement("div");
      fieldEl.className = "field";

      const labelEl = document.createElement("label");
      labelEl.setAttribute("for", field.id);
      labelEl.textContent = field.label;
      fieldEl.appendChild(labelEl);

      const selectEl = document.createElement("select");
      selectEl.id = field.id;
      field.options.forEach((option) => {
        const optionEl = document.createElement("option");
        optionEl.value = option.value;
        optionEl.textContent = option.label;
        if (option.value === state.values[state.mode][field.id]) {
          optionEl.selected = true;
        }
        selectEl.appendChild(optionEl);
      });
      selectEl.addEventListener("change", (event) => {
        state.values[state.mode][field.id] = event.target.value;
        renderResult();
      });
      fieldEl.appendChild(selectEl);

      const helpEl = document.createElement("small");
      helpEl.textContent = field.help;
      fieldEl.appendChild(helpEl);

      fieldListEl.appendChild(fieldEl);
    });

    cardEl.appendChild(fieldListEl);
    questionGroupsEl.appendChild(cardEl);
  });
}

function renderChecklist() {
  const modeConfig = modeConfigs[state.mode];
  const checks = state.checks[state.mode];
  evidenceChecklistEl.innerHTML = "";

  modeConfig.checklist.forEach((item, index) => {
    const wrapper = document.createElement("label");
    wrapper.className = "check-item";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checks[index];
    input.addEventListener("change", (event) => {
      checks[index] = event.target.checked;
      renderResult();
    });
    wrapper.appendChild(input);

    const text = document.createElement("div");
    text.className = "check-text";
    text.innerHTML = `<strong>${item.title}</strong><span>${item.description}</span>`;
    wrapper.appendChild(text);

    evidenceChecklistEl.appendChild(wrapper);
  });
}

function calculateResult() {
  const modeConfig = modeConfigs[state.mode];
  const route = routes[state.route];
  const impacts = [];
  let score = route.baseRisk;

  modeConfig.groups.forEach((group) => {
    group.fields.forEach((field) => {
      const selected = getSelectedOption(state.mode, field.id);
      score += selected.score;
      impacts.push({
        label: field.label,
        choice: selected.label,
        value: selected.score,
        note: selected.note,
      });
    });
  });

  impacts.sort((a, b) => b.value - a.value);
  const bounded = Math.max(18, Math.min(93, score));

  let primary;
  if (bounded >= 72) {
    primary = "즉시 정리와 증거 확보가 필요한 고위험 상태입니다.";
  } else if (bounded >= 52) {
    primary = "주요 쟁점이 뚜렷해 조기 대응이 필요한 상태입니다.";
  } else {
    primary = "핵심 위험은 보이지만 사실관계 보강이 더 필요합니다.";
  }

  return {
    score: bounded,
    primary,
    impacts: impacts.slice(0, 4),
  };
}

function buildCaseBrief(result) {
  const route = routes[state.route];
  const modeConfig = modeConfigs[state.mode];
  const leadingFacts = result.impacts.slice(0, 3).map((item) => `${item.label}은 "${item.choice}"으로 입력됐습니다.`);
  return `${modeConfig.label} 모드에서 ${route.name} 셀로 라우팅됐고, 현재 위험도는 ${result.score}점입니다. ${leadingFacts.join(" ")} ${route.summary}`;
}

function renderBriefFacts(result) {
  const route = routes[state.route];
  const modeConfig = modeConfigs[state.mode];
  briefFactsEl.innerHTML = "";

  [
    modeConfig.label,
    route.name,
    ...result.impacts.slice(0, 2).map((item) => `${item.label}: ${item.choice}`),
  ].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "brief-tag";
    tag.textContent = text;
    briefFactsEl.appendChild(tag);
  });
}

function renderChecklistProgress() {
  const checks = Object.values(state.checks[state.mode]);
  const completed = checks.filter(Boolean).length;
  const total = checks.length;
  const ratio = total === 0 ? 0 : (completed / total) * 100;

  evidenceProgressTextEl.textContent = `${completed} / ${total} 확보`;
  evidenceProgressFillEl.style.width = `${ratio}%`;
}

function renderImpactList(items) {
  impactListEl.innerHTML = "";
  items.forEach((item) => {
    const itemEl = document.createElement("div");
    itemEl.className = "impact-item";

    const metaEl = document.createElement("div");
    metaEl.className = "impact-meta";
    metaEl.innerHTML = `<strong>${item.label}</strong><span>+${item.value}</span>`;
    itemEl.appendChild(metaEl);

    const trackEl = document.createElement("div");
    trackEl.className = "impact-track";
    const fillEl = document.createElement("div");
    fillEl.className = "impact-fill";
    fillEl.style.width = `${Math.min(100, item.value * 4)}%`;
    trackEl.appendChild(fillEl);
    itemEl.appendChild(trackEl);

    const noteEl = document.createElement("div");
    noteEl.className = "impact-note";
    noteEl.textContent = item.note;
    itemEl.appendChild(noteEl);

    impactListEl.appendChild(itemEl);
  });
}

function renderList(target, items) {
  target.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    target.appendChild(li);
  });
}

function renderLegal(items) {
  legalGridEl.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "legal-card";
    card.innerHTML = `<strong>${item.title}</strong><p>${item.text}</p>`;
    legalGridEl.appendChild(card);
  });
}

function getCurrentModeBundle() {
  return legalBundles?.modes?.[state.mode] || null;
}

function renderLegalSources() {
  if (!legalSourceMetaEl || !legalSourceSummaryEl || !legalSourceListEl) {
    return;
  }

  legalSourceListEl.innerHTML = "";

  if (legalBundleError) {
    legalSourceMetaEl.textContent = "정적 근거 로드 실패";
    legalSourceSummaryEl.textContent = "법령 번들을 읽지 못했습니다. 배포된 data 파일 경로를 확인해야 합니다.";

    const message = document.createElement("p");
    message.className = "source-empty";
    message.textContent = legalBundleError;
    legalSourceListEl.appendChild(message);
    return;
  }

  if (!legalBundles) {
    legalSourceMetaEl.textContent = "사전 생성 데이터 로딩 중";
    legalSourceSummaryEl.textContent = "법제처 Open API로 생성한 근거 데이터를 불러오고 있습니다.";
    return;
  }

  const modeBundle = getCurrentModeBundle();
  if (!modeBundle) {
    legalSourceMetaEl.textContent = "실근거 없음";
    legalSourceSummaryEl.textContent = "현재 모드에 연결된 정적 근거 데이터가 아직 없습니다.";
    return;
  }

  const generatedAt = legalBundles.generatedAt ? legalBundles.generatedAt.slice(0, 10) : "";
  const provider = legalBundles.source?.provider || "법제처 API";
  legalSourceMetaEl.textContent = generatedAt ? `${provider} 기준 ${generatedAt}` : provider;
  legalSourceSummaryEl.textContent = `${modeBundle.summary} ${modeBundle.caution}`;

  modeBundle.laws.forEach((item) => {
    const card = document.createElement("article");
    card.className = "source-card";

    const head = document.createElement("div");
    head.className = "source-card-head";

    const titleBlock = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = `${item.lawName} ${item.articleTitle}`;
    titleBlock.appendChild(title);

    const reason = document.createElement("p");
    reason.className = "source-reason";
    reason.textContent = `왜 중요하나: ${item.why}`;
    titleBlock.appendChild(reason);
    head.appendChild(titleBlock);

    const meta = document.createElement("span");
    meta.textContent = `${item.lawType}\n시행 ${item.effectiveDate || "N/A"}`;
    head.appendChild(meta);
    card.appendChild(head);

    const snippet = document.createElement("p");
    snippet.className = "source-snippet";
    snippet.textContent = `핵심 문구: ${item.snippet}`;
    card.appendChild(snippet);

    const details = document.createElement("details");
    details.className = "source-details";
    const summary = document.createElement("summary");
    summary.textContent = "전문 보기";
    details.appendChild(summary);

    const body = document.createElement("p");
    body.className = "source-fulltext";
    body.textContent = item.body;
    details.appendChild(body);
    card.appendChild(details);

    legalSourceListEl.appendChild(card);
  });
}

function buildCaseMemo(result) {
  const route = routes[state.route];
  const modeConfig = modeConfigs[state.mode];
  const selectedLines = [];
  const modeBundle = getCurrentModeBundle();

  modeConfig.groups.forEach((group) => {
    group.fields.forEach((field) => {
      const selected = getSelectedOption(state.mode, field.id);
      selectedLines.push(`- ${field.label}: ${selected.label}`);
    });
  });

  return [
    `[상황] ${modeConfig.label}`,
    `[라우팅] ${route.name}`,
    `[현재 판단] ${result.primary}`,
    `[위험도] ${result.score} / 100`,
    "",
    "[입력한 사실관계]",
    ...selectedLines,
    "",
    "[우선 행동]",
    ...modeConfig.priorities.map((item) => `- ${item}`),
    "",
    "[핵심 증빙]",
    ...modeConfig.evidence.map((item) => `- ${item}`),
    "",
    "[법적 쟁점]",
    ...modeConfig.legal.map((item) => `- ${item.title}: ${item.text}`),
    ...(modeBundle ? [
      "",
      "[참고 법령]",
      ...modeBundle.laws.map((item) => `- ${item.lawName} ${item.articleTitle} (시행 ${item.effectiveDate || "N/A"})`),
    ] : []),
  ].join("\n");
}

function renderResult() {
  const route = routes[state.route];
  const modeConfig = modeConfigs[state.mode];
  const result = calculateResult();

  summaryRouteEl.textContent = route.name;
  summaryModeEl.textContent = modeConfig.label;
  summaryStatusEl.textContent = route.status;
  primaryOutcomeEl.textContent = result.primary;
  secondaryOutcomeEl.textContent = `${route.summary} ${modeConfig.baseSummary}`;
  riskScoreEl.textContent = String(result.score);

  renderBriefFacts(result);
  caseBriefEl.textContent = buildCaseBrief(result);
  renderChecklist();
  renderChecklistProgress();
  renderImpactList(result.impacts);
  renderList(priorityListEl, modeConfig.priorities);
  renderList(evidenceListEl, modeConfig.evidence);
  renderLegal(modeConfig.legal);
  renderLegalSources();
  renderList(counterfactualListEl, modeConfig.counterfactuals);
  caseMemoEl.value = buildCaseMemo(result);
}

function updateModeButtons() {
  modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === state.mode);
  });
}

function updateRouteButtons() {
  routeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.route === state.route);
  });
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    updateModeButtons();
    renderQuestionGroups();
    renderResult();
  });
});

routeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.route = button.dataset.route;
    updateRouteButtons();
    renderResult();
  });
});

if (copyMemoButtonEl && caseMemoEl) {
  copyMemoButtonEl.addEventListener("click", async () => {
    const originalText = copyMemoButtonEl.textContent;

    try {
      await navigator.clipboard.writeText(caseMemoEl.value);
      copyMemoButtonEl.textContent = "복사 완료";
      copyMemoButtonEl.classList.add("is-copied");
    } catch (error) {
      caseMemoEl.focus();
      caseMemoEl.select();
      document.execCommand("copy");
      copyMemoButtonEl.textContent = "복사 완료";
      copyMemoButtonEl.classList.add("is-copied");
    }

    window.setTimeout(() => {
      copyMemoButtonEl.textContent = originalText;
      copyMemoButtonEl.classList.remove("is-copied");
    }, 1200);
  });
}

initializeValues();
renderQuestionGroups();
renderResult();
loadLegalBundles().then(() => {
  renderResult();
});
