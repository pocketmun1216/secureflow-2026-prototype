/* 보안길잡이 AI — presentation-ready, browser-only prototype.
 * All analysis/reviews are explicitly simulated; no network, LLM, or backend calls.
 */
(function () {
  "use strict";
  const E = window.SecureFlowConfig;
  let browserStorage;
  try { browserStorage = window.localStorage; } catch (ignore) { browserStorage = null; }
  const institutions = E.createStore(browserStorage);

  const STEPS = [
    { id: "overview", label: "서비스 소개", icon: "home", step: "01" },
    { id: "intake", label: "프로젝트 분석", icon: "file", step: "02" },
    { id: "questions", label: "AI 추가 질문", icon: "chat", step: "03" },
    { id: "documents", label: "보안 서류 초안", icon: "docs", step: "04" },
    { id: "reviews", label: "전문가 협업 검토", icon: "users", step: "05" },
    { id: "submission", label: "제출 및 이력 관리", icon: "send", step: "06" },
    { id: "settings", label: "기관별 설정", icon: "settings", step: "관리" }
  ];

  const ICONS = {
    home: "<rect x='3' y='3' width='7' height='7' rx='1.4'/><rect x='14' y='3' width='7' height='7' rx='1.4'/><rect x='3' y='14' width='7' height='7' rx='1.4'/><rect x='14' y='14' width='7' height='7' rx='1.4'/>",
    file: "<path d='M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z'/><path d='M14 3v6h5M9 13h6M9 17h6'/>",
    chat: "<path d='M21 11.4a7.7 7.7 0 0 1-8 7.3 9.2 9.2 0 0 1-4-.9L4 20l1.5-4A8 8 0 1 1 21 11.4Z'/><path d='M8 11h8M8 14h5'/>",
    docs: "<rect x='5' y='3' width='14' height='18' rx='2'/><path d='M9 7h6M9 11h6M9 15h4'/>",
    users: "<circle cx='9' cy='8' r='3'/><path d='M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5'/>",
    send: "<path d='m22 2-7 20-4-9-9-4 20-7Z'/><path d='M22 2 11 13'/>",
    shield: "<path d='M12 2 20 5v6c0 5.7-3.5 9-8 11-4.5-2-8-5.3-8-11V5l8-3Z'/><path d='m9 12 2 2 4-4'/>",
    spark: "<path d='m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2ZM19 18l.6 1.4L21 20l-1.4.6L19 22l-.6-1.4L17 20l1.4-.6L19 18Z'/>",
    search: "<circle cx='10.8' cy='10.8' r='6.8'/><path d='m16 16 5 5'/>",
    check: "<path d='m5 12 4.5 4.5L19 7'/>",
    arrow: "<path d='M5 12h14m-6-6 6 6-6 6'/>",
    flow: "<rect x='3' y='3' width='6' height='6' rx='1'/><rect x='15' y='15' width='6' height='6' rx='1'/><path d='M9 6h6a3 3 0 0 1 3 3v6M12 18H6a3 3 0 0 1-3-3V9'/>",
    download: "<path d='M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3'/>",
    alert: "<path d='m12 3 10 18H2L12 3Z'/><path d='M12 9v5m0 3h.01'/>",
    clock: "<circle cx='12' cy='12' r='9'/><path d='M12 7v6l4 2'/>",
    settings: "<path d='M4 7h16M4 17h16M8 4v6m8 4v6'/>"
  };

  function icon(name, size) {
    return "<svg width='" + (size || 18) + "' height='" + (size || 18) + "' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>" + (ICONS[name] || ICONS.file) + "</svg>";
  }
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }
  function valueOrPending(value) {
    return value && String(value).trim() ? esc(value) : "<span class='unknown'>담당자 확인 필요</span>";
  }
  function stamp() {
    return new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
  }
  function blankProject() {
    return { name: "", department: "", description: "", hosting: "unknown", personal: "unknown", external: "unknown",
      sourceIp: "", destIp: "", port: "", protocol: "미정", purpose: "",
      usePeriod: "", accessControl: "", logging: "", securityMeasures: "", ownerName: "" };
  }
  function sampleProject() {
    return {
      name: "공공데이터 연계 민원 분석 서비스",
      department: "디지털혁신팀",
      description: "기관 내부 업무망에 설치한 분석 서버에서 외부 공공데이터 API를 HTTPS로 호출하여 지역별 민원 관련 공개 통계 데이터를 수집하고, 내부 업무 담당자에게 분석 대시보드를 제공하는 프로젝트입니다. 수집 결과는 업무용 데이터베이스에 보관하며 대국민 직접 접속 기능은 없습니다.",
      hosting: "internal",
      personal: "unknown",
      external: "yes",
      sourceIp: "192.0.2.12",
      destIp: "198.51.100.24",
      port: "443",
      protocol: "TCP",
      purpose: "외부 공공데이터 API 호출",
      usePeriod: "2026.11.01 ~ 2026.12.31 (시연 예시)",
      accessControl: "기관 계정 인증 및 업무 담당자 역할별 접근 권한 적용 (시연 예시)",
      logging: "접속 이력을 기록하고 보관 기간은 기관 정책에 따라 확정 (시연 예시)",
      securityMeasures: "전송 구간 암호화, 최소 권한, 정기 취약점 점검 (시연 예시)",
      ownerName: "시연 담당자"
    };
  }
  function makeState(agencyId) {
    return {
      agencyId: agencyId || "agency_a", configSnapshot: null, custom: {}, tasks: {}, rework: false,
      current: "overview", sample: false, project: blankProject(), analysis: false, docs: false,
      docTab: "firewall", securityPort: "", checks: null, reviewRequested: false,
      confirmed: false, prepared: false, submitted: false, history: []
    };
  }
  let state = makeState();
  let projectFileRead = 0;
  const admin = window.SecureFlowAdmin({
    engine: E, store: institutions, esc: esc, icon: icon, toast: toast,
    render: function () { render(); },
    onPublish: function (id) {
      if (id === state.agencyId && state.configSnapshot) addHistory("기관의 새 설정이 게시되었습니다. 현재 신청은 기존 v" + state.configSnapshot.version + "을 유지합니다");
    }
  });
  function pack() { return state.configSnapshot || institutions.published(state.agencyId); }
  function templates() { return E.activeTemplates(pack(), state.project); }
  function reviewTasks() { return E.tasksFor(pack(), state.project); }
  function record(task) {
    if (!state.tasks[task.id]) state.tasks[task.id] = { status: "not_started", note: "" };
    return state.tasks[task.id];
  }
  function allReviewed() {
    return state.reviewRequested && !state.rework && reviewTasks().length > 0 && reviewTasks().every(function (task) { return record(task).status === "approved"; });
  }
  function clearReviews() {
    state.reviewRequested = false; state.tasks = {}; state.rework = false;
    state.confirmed = false; state.prepared = false; state.submitted = false;
  }
  function configBanner() {
    const p = pack(), latest = institutions.published(state.agencyId);
    return "<div class='config-banner config-project'><div>" + icon("settings", 18) + "<span><b>" + esc(p.name) + " · 설정 v" + p.version + "</b><small>" +
      (state.configSnapshot ? "이 신청에 고정된 양식·처리 절차" : "분석 시작 시 현재 게시본 적용") + "</small></span></div><div class='config-actions'>" +
      (latest.version > p.version ? "<span class='tag orange'>새 설정 v" + latest.version + "</span><button class='btn btn-soft btn-small' data-action='apply-latest'>새 설정 적용</button>" : "<span class='tag gray'>" + p.templates.length + "종 양식 · " + p.workflow.length + "개 검토 단계</span>") +
      "<button class='btn btn-ghost btn-small' data-action='manage-current'>기관 설정 보기</button></div></div>";
  }

  function addHistory(message) {
    state.history.unshift({ message: message, time: stamp() });
    if (state.history.length > 15) state.history.length = 15;
  }
  function toast(message, warning) {
    const area = document.getElementById("toast-region");
    const item = document.createElement("div");
    item.className = "toast" + (warning ? " warn" : "");
    item.textContent = message;
    area.appendChild(item);
    window.setTimeout(function () { item.remove(); }, 3700);
  }
  function resetDownstream() {
    if (state.docs || state.reviewRequested) addHistory("입력 변경으로 서류·검토·최종 확인을 초기화했습니다");
    state.docs = false;
    state.checks = null;
    clearReviews();
  }
  function go(page) {
    state.current = page;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("sidebar").classList.remove("open");
  }
  function renderNav() {
    document.getElementById("institution-switch").innerHTML = institutions.ids().map(function (id) {
      const p = institutions.published(id);
      return "<option value='" + id + "'" + (id === state.agencyId ? " selected" : "") + ">" + esc(p.name) + " · v" + p.version + "</option>";
    }).join("");
    document.getElementById("side-nav").innerHTML = STEPS.map(function (item) {
      return "<button type='button' class='nav-item" + (state.current === item.id ? " active" : "") + "' data-action='nav' data-page='" + item.id + "'" + (state.current === item.id ? " aria-current='page'" : "") + ">" +
        "<span class='nav-icon'>" + icon(item.icon, 18) + "</span><span>" + item.label + "</span><span class='nav-step'>" + item.step + "</span></button>";
    }).join("");
    const entry = STEPS.find(function (x) { return x.id === state.current; });
    document.getElementById("breadcrumb").textContent = "워크스페이스  /  " + (entry ? entry.label : "서비스 소개");
  }
  function header(eyebrow, title, description, actions) {
    return "<div class='page-head'><div><span class='eyebrow'>" + eyebrow + "</span><h1>" + title + "</h1><p>" + description + "</p></div>" +
      (actions ? "<div class='page-actions'>" + actions + "</div>" : "") + "</div>";
  }
  function demoNotice() {
    return "<div class='demo-notice'><span class='help-dot'>i</span><span>팀 소개용 프로토타입입니다. 분석·검토는 모의 동작이며 실제 LLM·외부 전송·전자결재와 연결되지 않습니다. 기관 설정만 이 브라우저에 저장되며, 원본 파일·프로젝트 입력은 서버에 저장하지 않습니다.</span></div>";
  }
  function renderOverview() {
    return [
      "<section class='hero'>",
      "<div class='hero-copy'><div class='hero-kicker'>2026 공공 AI 대전환 챌린지 · 팀 프로젝트</div>",
      "<h1>보안을 몰라도,<br><em>보안 업무는 앞으로.</em></h1>",
      "<p>프로젝트 개요만 알려주세요. AI가 필요한 정보를 질문하고, 보안 신청 서류를 작성하며, 보안·인프라 담당자와의 검토 과정을 하나로 연결합니다.</p>",
      "<div class='hero-actions'><button class='btn btn-primary' data-action='start-sample'>", icon("spark", 17), " 샘플 프로젝트 시연하기 ", icon("arrow", 16), "</button>",
      "<button class='btn btn-secondary' data-action='start-blank'>내 프로젝트 직접 입력하기</button></div></div>",
      "<div class='hero-visual' aria-hidden='true'><div class='hero-orbit'></div><div class='hero-orbit two'></div><div class='hero-orbit three'></div>",
      "<div class='floating-tag'>✦ AI 검토 지원</div><div class='floating-doc'><div class='doc-top'><span class='doc-mini-title'>보안성 검토서</span><span class='doc-mini-status'>검토 준비</span></div>",
      "<div class='dline md'></div><div class='dline'></div><div class='dline sm'></div><div class='dline indigo'></div><div class='dline md'></div><div class='dline sm'></div><div class='dline'></div></div>",
      "<div class='floating-check'>✓</div></div>",
      "</section>",
      "<section class='institution-feature'><div class='section-title-row'><div><span class='eyebrow'>NEW · INSTITUTION STUDIO</span><h2 class='subheading'>같은 프로젝트, 우리 기관의 양식과 절차로</h2><p class='section-subtitle'>보안담당자가 양식 항목과 검토 단계를 설정하면 신청자의 질문·문서·검토 흐름에 함께 반영됩니다.</p></div><button class='btn btn-primary' data-action='manage-current'>", icon("settings", 16), " 기관별 설정 체험</button></div>",
      "<div class='institution-compare'>",
      institutions.ids().map(function (id) { const p = institutions.published(id); return "<div class='institution-example'><span class='tag " + (id === state.agencyId ? "blue" : "gray") + "'>" + esc(p.name) + " · v" + p.version + "</span><h3>" + esc(p.subtitle) + "</h3><p>" + p.templates.length + "종 양식 · " + p.workflow.map(function (s) { return s.roles.map(function (r) { return E.roles[r].short; }).join(" + ") + (s.condition !== "always" ? " (조건부)" : ""); }).join(" → ") + "</p><button class='btn btn-secondary btn-small' data-action='use-agency' data-agency='" + id + "'>" + (id === state.agencyId ? "이 기관 설정으로 시작" : "이 기관으로 전환") + " " + icon("arrow", 14) + "</button></div>"; }).join(""),
      "</div></section>",
      "<section class='overview-metrics'><div class='metric'><div class='metric-icon blue'>", icon("docs", 22), "</div><div><strong>문서 작성</strong><span>방화벽 신청서 · 보안성 검토서</span></div></div>",
      "<div class='metric'><div class='metric-icon cyan'>", icon("users", 22), "</div><div><strong>전문가 협업</strong><span>정보보안 · ICT인프라 담당자</span></div></div>",
      "<div class='metric'><div class='metric-icon amber'>", icon("flow", 22), "</div><div><strong>절차 통합 관리</strong><span>작성 · 검토 · 보완 · 제출 준비</span></div></div></section>",
      "<div class='section-title-row'><div><h2 class='subheading'>문서 생성에서 끝나지 않습니다</h2><div class='section-subtitle'>서로 다른 담당자의 지식을 하나의 업무 흐름으로 연결하는 AI 협업 에이전트</div></div><span class='tag blue'>핵심 차별화 기능</span></div>",
      "<section class='feature-grid'>",
      "<article class='feature-card'><span class='feature-number'>FEATURE 01</span><div class='feature-symbol'>", icon("chat", 22), "</div><h3>부족한 정보를 AI가 질문</h3><p>사용자가 보안 용어를 몰라도 프로젝트 유형에 따라 필요한 항목을 단계적으로 확인합니다. 확인되지 않은 정보는 전문가 검토 대상으로 표시합니다.</p></article>",
      "<article class='feature-card'><span class='feature-number'>FEATURE 02</span><div class='feature-symbol'>", icon("search", 22), "</div><h3>문서 간 오류 자동 점검</h3><p>두 서류의 공통 정보를 일관되게 반영하고, 포트 불일치와 IP·개인정보 항목의 누락을 자동 표시하여 보완을 돕습니다.</p></article>",
      "<article class='feature-card'><span class='feature-number'>FEATURE 03</span><div class='feature-symbol'>", icon("users", 22), "</div><h3>부서별 검토 이력 통합</h3><p>정보보안·ICT인프라 담당자의 보완 의견과 검토 상태를 함께 관리하고, 사용자가 최종 서류를 확인할 수 있도록 지원합니다.</p></article>",
      "</section>",
      "<div class='section-title-row'><h2 class='subheading'>한눈에 보는 업무 흐름</h2><span class='tag gray'>INTERACTIVE FLOW</span></div>",
      "<div class='flow-strip'><div class='flow-node'><span class='flow-circle'>1</span><span class='flow-label'>프로젝트<br>개요 입력</span></div><span class='flow-arrow'>›</span>",
      "<div class='flow-node'><span class='flow-circle'>2</span><span class='flow-label'>AI 분석과<br>추가 질문</span></div><span class='flow-arrow'>›</span>",
      "<div class='flow-node'><span class='flow-circle'>3</span><span class='flow-label'>보안 서류<br>초안 생성</span></div><span class='flow-arrow'>›</span>",
      "<div class='flow-node'><span class='flow-circle'>4</span><span class='flow-label'>전문가 협업<br>및 보완</span></div><span class='flow-arrow'>›</span>",
      "<div class='flow-node'><span class='flow-circle'>5</span><span class='flow-label'>최종 확인<br>· 제출 준비</span></div></div>",
      "<div class='callout' style='margin-top:20px'><span class='callout-symbol'>", icon("shield", 20), "</span><p><b>설계 원칙</b> — AI는 정보 추출·초안 작성·오류 점검을 지원합니다. 실제 보안 적합성 판단과 승인 권한은 담당자에게 있으며, 기관별 규정과 보안 정책에 따라 절차를 구성해야 합니다.</p></div>",
      demoNotice()
    ].join("");
  }

  function renderIntake() {
    const p = state.project;
    return header("STEP 01 · PROJECT INTAKE", "어떤 프로젝트를 준비하고 계신가요?", "프로젝트 개요를 입력하면 AI가 필요한 보안 문서와 확인 사항을 분석합니다.",
      "<span class='tag blue'>첫 단계</span>") +
      "<div class='split-grid'><section class='panel'><div class='panel-header'><div><h2>프로젝트 기본 정보</h2><p>외부 LLM으로 작성한 개요서를 붙여 넣어도 됩니다. 민감한 정보는 입력하지 마세요.</p></div><span class='tag gray'>입력</span></div>" +
      "<div class='form-row'><div class='field'><label for='project-name'>프로젝트명 <small>필수</small></label><input id='project-name' data-field='name' value='" + esc(p.name) + "' placeholder='예: 공공데이터 연계 민원 분석 서비스'/></div>" +
      "<div class='field'><label for='department'>담당 부서</label><input id='department' data-field='department' value='" + esc(p.department) + "' placeholder='예: 디지털혁신팀'/></div></div>" +
      "<div class='field'><label for='project-desc'>프로젝트 개요 <small>필수</small></label><textarea id='project-desc' data-field='description' placeholder='목적, 구축 환경, 연계 대상, 데이터 종류, 주요 기능을 자유롭게 작성해주세요.'>" + esc(p.description) + "</textarea>" +
      "<div class='field-hint'>텍스트(.txt) 또는 Markdown(.md) 파일을 불러올 수도 있습니다. HWPX/PDF 분석은 정식 개발 범위입니다.</div></div>" +
      "<div class='panel-footer'><div><label class='btn btn-secondary btn-small' for='file-input'>" + icon("file", 14) + " 개요서 파일 불러오기</label><input type='file' id='file-input' accept='.txt,.md,text/plain,text/markdown' hidden/></div>" +
      "<button class='btn btn-primary' data-action='analyze'>" + icon("spark", 16) + " 프로젝트 분석하기 " + icon("arrow", 15) + "</button></div></section>" +
      "<aside class='panel sticky-aside'><div class='panel-header'><div><h3>AI 분석에서 확인할 항목</h3><p>어떤 보안 업무가 필요한지 사전 점검합니다.</p></div></div>" +
      "<ul class='simple-list'><li><span class='list-mark'>01</span><span><b>프로젝트의 운영 환경</b><br>내부망, 외부 클라우드 등 시스템 배치 환경</span></li>" +
      "<li><span class='list-mark'>02</span><span><b>외부 시스템 연계</b><br>API 호출과 네트워크 통신 필요 여부</span></li>" +
      "<li><span class='list-mark'>03</span><span><b>데이터 특성</b><br>개인정보 처리와 보안 고려사항</span></li>" +
      "<li><span class='list-mark'>04</span><span><b>담당자 확인 항목</b><br>IP, 포트, 검토 범위 등 전문 정보</span></li></ul>" +
      "<hr class='small-divider'/><div class='status-block'><div class='label'>INSTITUTION TEMPLATES · v" + pack().version + "</div><strong>" + esc(pack().name) + " 등록 양식</strong><div class='question-doc-list'>" + pack().templates.map(function (t) { return "<p>· " + esc(t.title) + "</p>"; }).join("") + "</div><p>기관 설정과 추가 질문 응답에 따라 필요한 양식을 적용합니다.</p></div>" +
      "<div class='callout gold'><span class='callout-symbol'>!</span><p>실제 기관명, 내부 IP, 실서비스 구성 정보 등 비공개 내용을 업로드하지 마세요. 제공된 샘플 IP는 문서 예시 전용 대역입니다.</p></div></aside></div>" + demoNotice();
  }

  function choice(field, value, label) {
    return "<button type='button' class='choice" + (state.project[field] === value ? " active" : "") + "' aria-pressed='" + (state.project[field] === value) + "' data-action='choose' data-field='" + field + "' data-value='" + value + "'>" + label + "</button>";
  }
  function renderQuestions() {
    if (!state.analysis) return empty("분석 결과가 아직 없습니다", "먼저 프로젝트 개요를 입력하고 분석을 진행해주세요.", "프로젝트 입력하기", "intake");
    const p = state.project;
    const signals = [];
    if (/API|연계|호출|외부/i.test(p.description)) signals.push("외부 시스템 연계 후보");
    if (/AI|LLM|모델|분석/i.test(p.description)) signals.push("AI·데이터 처리");
    if (/민원|행정|공공/i.test(p.description)) signals.push("공공 업무 서비스");
    if (!signals.length) signals.push("일반 정보화 프로젝트");
    return header("STEP 02 · SMART QUESTIONNAIRE", "AI가 필요한 정보를 추가로 확인합니다", "분석 결과를 바탕으로 쉬운 질문부터 묻고, 확인되지 않은 전문 정보는 담당자 확인 항목으로 남깁니다.") +
      "<div class='split-grid'><div><div class='status-block'><span class='label'>PROJECT UNDERSTANDING</span><strong>" + esc(p.name) + "</strong><div class='pill-row' style='margin-top:12px'>" + signals.map(function (x) { return "<span class='tag blue'>" + esc(x) + "</span>"; }).join("") + "</div></div>" +
      "<section class='q-list'><div class='question-card'><div class='q-top'><span class='q-index'>01</span><div><strong>시스템은 어디에서 운영되나요?</strong><p>서버가 위치하는 환경에 따라 필요한 검토 정보가 달라질 수 있습니다.</p></div></div><div class='choice-group'>" +
      choice("hosting", "internal", "기관 내부망") + choice("hosting", "public", "대국민 서비스망") + choice("hosting", "cloud", "외부 클라우드") + choice("hosting", "unknown", "아직 미정") + "</div></div>" +
      "<div class='question-card'><div class='q-top'><span class='q-index'>02</span><div><strong>외부 시스템/API와 통신하나요?</strong><p>외부 통신 여부는 방화벽 검토와 연계됩니다.</p></div></div><div class='choice-group'>" +
      choice("external", "yes", "예 · 외부 통신 있음") + choice("external", "no", "아니오") + choice("external", "unknown", "확인 필요") + "</div></div>" +
      "<div class='question-card'><div class='q-top'><span class='q-index'>03</span><div><strong>개인정보를 수집하거나 처리하나요?</strong><p>단순히 공개 통계만 사용하더라도 실제 처리 범위를 확인해야 합니다.</p></div></div><div class='choice-group'>" +
      choice("personal", "yes", "예 · 포함") + choice("personal", "no", "아니오") + choice("personal", "unknown", "담당자 확인 필요") + "</div></div>" +
      (p.external === "no" ? "<div class='callout'><span class='callout-symbol'>ℹ</span><p>외부 통신이 없다고 답했습니다. 방화벽 신청 여부는 기관별 운영 정책에 따라 담당자가 확인해야 합니다. 아래 네트워크 항목은 필요한 경우에만 입력하세요.</p></div>" : "") +
      "<div class='question-card'><div class='q-top'><span class='q-index'>04</span><div><strong>네트워크 통신 정보가 확인되었나요?</strong><p>IP와 포트를 모르면 빈칸으로 두세요. AI가 임의로 채우지 않습니다.</p></div></div>" +
      "<div class='q-inline-fields'><div class='field'><label for='source-ip'>출발지 IP</label><input id='source-ip' data-field='sourceIp' value='" + esc(p.sourceIp) + "' placeholder='담당자 확인 필요'/></div>" +
      "<div class='field'><label for='dest-ip'>목적지 IP</label><input id='dest-ip' data-field='destIp' value='" + esc(p.destIp) + "' placeholder='담당자 확인 필요'/></div></div>" +
      "<div class='q-inline-fields'><div class='field'><label for='protocol'>프로토콜</label><select id='protocol' data-field='protocol'><option value='TCP'" + (p.protocol === "TCP" ? " selected" : "") + ">TCP</option><option value='UDP'" + (p.protocol === "UDP" ? " selected" : "") + ">UDP</option><option value='미정'" + (p.protocol === "미정" ? " selected" : "") + ">미정</option></select></div>" +
      "<div class='field'><label for='dest-port'>목적지 포트</label><input id='dest-port' data-field='port' value='" + esc(p.port) + "' placeholder='예: 443'/></div></div>" +
      "<div class='field' style='margin-bottom:0'><label for='purpose'>통신 목적</label><input id='purpose' data-field='purpose' value='" + esc(p.purpose) + "' placeholder='예: 외부 공공데이터 API 호출'/></div></div>" + extraQuestions() + "</section>" +
      "<div class='panel-footer' style='margin-top:17px'><button class='btn btn-secondary' data-action='nav' data-page='intake'>← 프로젝트 정보 수정</button><button class='btn btn-primary' data-action='generate'>" + icon("docs", 16) + " 보안 서류 초안 생성 " + icon("arrow", 16) + "</button></div></div>" +
      "<aside class='sticky-aside'><div class='panel'><div class='panel-header'><div><h3>AI 분석 요약</h3><p>입력 문서와 추가 질문에 근거한 정보입니다.</p></div><span class='tag blue'>모의 분석</span></div>" +
      "<div class='info-key'><span>문서 생성 대상</span><strong>기관 양식 " + templates().length + "종</strong></div><div class='info-key'><span>외부 연계</span><strong>" + externalLabel(p.external) + "</strong></div>" +
      "<div class='info-key'><span>운영 환경</span><strong>" + hostingLabel(p.hosting) + "</strong></div><div class='info-key'><span>개인정보</span><strong>" + personalLabel(p.personal) + "</strong></div><hr class='small-divider'/>" +
      "<div class='overview-summary'><div class='summary-title'>확인 상태</div>" +
      "<div class='summary-item'><span class='check-icon'>✓</span><span>프로젝트 개요 입력 완료</span></div>" +
      "<div class='summary-item " + (p.personal === "unknown" ? "warning" : "") + "'><span class='check-icon'>" + (p.personal === "unknown" ? "!" : "✓") + "</span><span>개인정보 처리 여부 " + (p.personal === "unknown" ? "미확정" : "응답 완료") + "</span></div>" +
      "<div class='summary-item " + (!p.destIp && p.external !== "no" ? "warning" : "") + "'><span class='check-icon'>" + (!p.destIp && p.external !== "no" ? "!" : "✓") + "</span><span>목적지 IP " + (!p.destIp && p.external !== "no" ? "담당자 확인 필요" : "입력됨") + "</span></div></div>" +
      "</div><div class='callout' style='margin-top:17px'><span class='callout-symbol'>" + icon("spark", 19) + "</span><p>기관 양식에 등록된 추가 항목이 질문에 자동 반영됩니다. 모르는 값은 비워두세요. 필수값이 없으면 초안에는 확인 필요로 표시하고 최종 패키지 생성은 제한합니다.</p></div></aside></div>" + demoNotice();
  }
  function extraQuestions() {
    const base = ["name", "department", "description", "hosting", "external", "personal", "sourceIp", "destIp", "protocol", "port", "purpose"];
    const fields = [];
    templates().forEach(function (t) {
      t.fields.forEach(function (f) {
        if (base.includes(f.key)) return;
        const existing = fields.find(function (x) { return x.key === f.key; });
        if (existing) { existing.required = existing.required || f.required; return; }
        fields.push({ key: f.key, label: f.label, required: f.required, title: t.title });
      });
    });
    if (!fields.length) return "";
    return "<div class='question-card institution-question'><div class='q-top'><span class='q-index'>05</span><div><strong>" + esc(pack().name) + " 양식에 필요한 추가 정보</strong><p>관리자가 설정한 항목입니다. 공통 항목은 여러 문서에 함께 반영됩니다.</p></div></div><div class='extra-fields'>" +
      fields.map(function (f) {
        const custom = f.key.startsWith("custom_"), value = custom ? state.custom[f.key] : state.project[f.key];
        return "<div class='field'><label for='extra-" + f.key + "'>" + esc(f.label) + (f.required ? " <small>필수</small>" : " <small>선택</small>") + "</label><textarea rows='2' id='extra-" + f.key + "' " + (custom ? "data-custom" : "data-field") + "='" + f.key + "' placeholder='확인된 정보만 입력하세요'>" + esc(value || "") + "</textarea><div class='field-hint'>" + esc(f.title) + (custom ? " · 기관 전용 항목" : " · 공통 정보 연결") + "</div></div>";
      }).join("") + "</div></div>";
  }
  function hostingLabel(v) { return { internal: "기관 내부망", public: "대국민 서비스망", cloud: "외부 클라우드", unknown: "미정" }[v] || "미정"; }
  function externalLabel(v) { return { yes: "외부 연계 있음", no: "외부 연계 없음", unknown: "미확정" }[v] || "미확정"; }
  function personalLabel(v) { return { yes: "개인정보 포함", no: "포함하지 않음", unknown: "확인 필요" }[v] || "확인 필요"; }
  function row(label, value) { return "<tr><th>" + label + "</th><td>" + value + "</td></tr>"; }

  function fieldValue(field, template) {
    let value = field.key.startsWith("custom_") ? state.custom[field.key] : state.project[field.key];
    if (field.key === "port" && template.kind === "security") value = state.securityPort;
    if (!value || value === "unknown" || value === "미정") return "<span class='unknown'>담당자 확인 필요" + (field.required ? " · 필수" : "") + "</span>";
    if (field.key === "hosting") return esc(hostingLabel(value));
    if (field.key === "personal") return esc(personalLabel(value));
    if (field.key === "external") return esc(externalLabel(value));
    return esc(value).replace(/\n/g, "<br/>");
  }
  function paper(id) {
    const template = templates().find(function (t) { return t.id === id; });
    if (!template) return "";
    const p = pack();
    const fields = template.fields.map(function (f, index) {
      const label = esc(f.label) + (f.required ? " <small>*</small>" : "");
      return template.layout === "sections" ?
        "<div class='paper-field'><h4>" + (index + 1) + ". " + label + "</h4><div>" + fieldValue(f, template) + "</div></div>" :
        row(label, fieldValue(f, template));
    }).join("");
    const main = template.layout === "sections" ? fields : "<div class='paper-section'><h4>신청·검토 항목</h4><table>" + fields + "</table></div>";
    const reviews = reviewTasks().map(function (task) {
      const r = record(task);
      return row(esc(task.stageTitle + " · " + E.roles[task.role].short), esc(reviewLabel(r.status)) + (r.note ? "<div class='paper-review-meta'>" + esc(r.note).replace(/\n/g, "<br/>") + "</div>" : ""));
    }).join("");
    return "<article class='paper'><div class='paper-header'><div class='paper-eyebrow'>" + esc(p.name) + " · 양식·절차 v" + p.version + "</div><h3 class='paper-title'>" + esc(template.title) + "</h3></div>" +
      "<div class='paper-stamp'>시연용 초안 | 실제 승인 문서가 아닙니다</div>" + main +
      "<div class='paper-section'><h4>기관 처리 절차 · 모의 검토 상태</h4><table>" + reviews + "</table></div>" +
      "<div class='paper-note'>※ 기관 관리자가 설정한 항목과 출력 형식을 반영한 시연 문서입니다. 원본 파일의 디자인·표 병합을 그대로 재현하지는 않습니다. 샘플 IP는 TEST-NET 예시 주소이며 실제 승인·보안 적합성 효력이 없습니다. * 필수 항목</div></article>";
  }
  function reviewLabel(status) {
    return { approved: "검토 완료(시연)", changes: "보완 요청", requested: "검토 대기", not_started: "검토 전" }[status] || "검토 전";
  }
  function conflictAvailable() {
    return ["firewall", "security"].every(function (kind) { return templates().some(function (t) { return t.kind === kind && t.fields.some(function (f) { return f.key === "port"; }); }); });
  }
  function makeChecks() {
    const p = state.project;
    const issues = E.missingFields(pack(), p, state.custom).map(function (f) { return { title: f.label + " · 필수값 확인 필요", message: f.template + "에 필요한 항목입니다. 추가 질문에서 확인된 정보를 입력해주세요." }; });
    if (conflictAvailable() && String(p.port).trim() !== String(state.securityPort).trim())
      issues.push({ title: "문서 간 포트 불일치", message: "방화벽 양식의 " + p.port + "와 보안성 검토 양식의 " + state.securityPort + "가 다릅니다.", mismatch: true });
    templates().forEach(function (t) { if (E.conditionResult(t.condition, p) === "pending") issues.push({ title: "양식 사용 조건 미확정", message: t.title + " · " + E.conditions[t.condition] }); });
    E.activeStages(pack(), p).forEach(function (s) { if (s.pendingCondition) issues.push({ title: "검토 단계 조건 미확정", message: s.title + " · " + E.conditions[s.condition] }); });
    if (!templates().length) issues.push({ title: "적용 가능한 양식 없음", message: "기관별 양식 사용 조건을 확인해주세요." });
    const usedKeys = new Set(templates().flatMap(function (t) { return t.fields.map(function (f) { return f.key; }); }));
    if (usedKeys.has("port") && p.port && !/^\d{1,5}$/.test(p.port.trim())) issues.push({ title: "포트 형식 확인", message: "이번 시연은 1~65535 사이의 단일 포트를 지원합니다." });
    else if (usedKeys.has("port") && p.port && (+p.port < 1 || +p.port > 65535)) issues.push({ title: "포트 범위 오류", message: "포트는 1~65535 사이의 값이어야 합니다." });
    return issues;
  }
  function renderDocuments() {
    if (!state.docs) return empty("생성된 문서가 없습니다", "AI 질문에 응답한 후 보안 서류 초안을 생성해주세요.", "추가 질문으로 이동", state.analysis ? "questions" : "intake");
    const issues = state.checks;
    if (!templates().some(function (t) { return t.id === state.docTab; })) state.docTab = templates()[0] && templates()[0].id;
    return header("STEP 03 · DOCUMENT DRAFTING", "우리 기관 양식으로 초안이 준비되었습니다", "등록된 " + templates().length + "종 양식의 제목·항목·필수값·출력 형식을 반영했습니다. 실제 원본 파일 디자인과는 다를 수 있습니다.",
      "<button class='btn btn-secondary btn-small' data-action='nav' data-page='questions'>정보 수정</button>") +
      "<div class='doc-stage'><div><div class='doc-tabs'>" + templates().map(function (t) {
        return "<button class='tab" + (state.docTab === t.id ? " active" : "") + "' data-action='doc-tab' data-kind='" + t.id + "'>" + esc(t.title) + "</button>";
      }).join("") + "</div>" +
      "<div class='doc-window'>" + paper(state.docTab) + "</div>" +
      "<div class='panel-footer' style='padding:16px 0;border:0'><div class='pill-row'><button class='btn btn-secondary btn-small' data-action='download' data-kind='" + state.docTab + "'>" + icon("download", 14) + " HTML 문서 다운로드</button>" +
      (conflictAvailable() ? "<button class='btn btn-ghost btn-small' data-action='inject-conflict'>⚡ 포트 불일치 사례 시연</button>" : "") + "</div>" +
      "<button class='btn btn-primary' data-action='nav' data-page='reviews'>담당자 협업 검토 " + icon("arrow", 16) + "</button></div></div>" +
      "<aside class='sticky-aside'><section class='panel'><div class='panel-header'><div><h3>AI 문서 정합성 점검</h3><p>서류 간 일치 여부와 미확정 항목을 확인합니다.</p></div><span class='tag blue'>차별화 기능</span></div>" +
      "<div class='status-block'><div class='label'>CROSS-DOCUMENT VALIDATION</div><strong>" + (issues === null ? "점검 전" : issues.length === 0 ? "불일치 없음" : issues.length + "개 확인 사항 발견") + "</strong><p>AI가 확인되지 않은 값을 지어내지 않도록 설계합니다.</p></div>" +
      "<div class='check-list'>" + (issues === null ? "<div class='check-result'><strong>점검을 실행해보세요</strong><p>등록 양식의 필수값, 조건 미확정, 문서 간 포트 불일치를 검사합니다.</p></div>" :
      issues.length === 0 ? "<div class='check-result ok'><strong>✓ 확인 가능한 항목 일치</strong><p>현재 입력값 기준으로 문서 간 포트 불일치가 없습니다. 실제 보안 적합성을 보증하는 의미는 아닙니다.</p></div>" :
      issues.map(function (x) { return "<div class='check-result warn'><strong>⚠ " + esc(x.title) + "</strong><p>" + esc(x.message) + "</p></div>"; }).join("")) + "</div>" +
      (issues && issues.some(function (x) { return x.mismatch; }) ? "<button class='btn btn-soft' style='width:100%;margin-top:12px' data-action='fix-port'>검토서 포트값 일치시키기 " + icon("arrow", 15) + "</button>" : "") +
      "<button class='btn btn-primary' style='width:100%;margin-top:14px' data-action='check-docs'>" + icon("search", 16) + " 정합성 점검 실행</button>" +
      "<hr class='small-divider'/><div class='panel-header' style='margin-bottom:0'><div><h3>다음 단계</h3><p>담당자 검토 요청과 보완 이력을 관리합니다.</p></div></div></section>" +
      "<div class='callout gold' style='margin-top:16px'><span class='callout-symbol'>!</span><p>양식에 필요한 항목이 빠졌다면 기관별 설정에서 추가하세요. 게시한 새 설정은 현재 신청에 명시적으로 적용해야 반영됩니다.</p></div></aside></div>" + demoNotice();
  }

  function statusBadge(s, locked) {
    if (s === "approved") return "<span class='tag green'>✓ 검토 완료</span>";
    if (s === "changes") return "<span class='tag orange'>보완 요청</span>";
    if (locked) return "<span class='tag gray'>선행 단계 대기</span>";
    if (s === "requested") return "<span class='tag blue'>검토 가능</span>";
    return "<span class='tag gray'>요청 전</span>";
  }
  function reviewerCard(task) {
    const r = record(task), role = E.roles[task.role];
    const allowed = E.canAct(task.id, pack(), state.project, state.tasks, state.reviewRequested) && !state.rework && r.status !== "approved";
    const locked = state.reviewRequested && !allowed && r.status !== "approved" && r.status !== "changes";
    return "<article class='review-card'><div class='review-person'><div class='review-avatar " + (task.role === "infra" ? "teal" : "") + "'>" + icon(task.role === "infra" ? "settings" : "shield", 23) +
      "</div><div><strong>" + role.label + "</strong><small>담당 역할 시연</small></div><div style='margin-left:auto'>" + statusBadge(r.status, locked) + "</div></div>" +
      "<p class='review-description'>" + role.description + "</p>" +
      "<div class='field-label' style='margin-bottom:9px'>검토 의견 · 시연용</div><textarea data-review-note='" + task.id + "' aria-label='" + esc(task.stageTitle + " " + role.short + " 의견") + "' " + (!allowed ? "disabled" : "") + " placeholder='보완 요청이나 검토 의견을 작성해주세요.'>" + esc(r.note) + "</textarea>" +
      "<div class='review-actions'><button class='btn btn-warning btn-small' data-action='review-change' data-reviewer='" + task.id + "' " + (!allowed ? "disabled" : "") + ">보완 요청 기록</button>" +
      "<button class='btn btn-primary btn-small' data-action='review-approve' data-reviewer='" + task.id + "' " + (!allowed ? "disabled" : "") + ">" + icon("check", 14) + " 검토 완료로 표시</button></div></article>";
  }
  function renderTimeline() {
    if (!state.history.length) return "<p class='section-subtitle'>아직 기록된 활동이 없습니다.</p>";
    return "<div class='timeline'>" + state.history.slice(0, 6).map(function (x) {
      return "<div class='timeline-event'><span class='timeline-dot done'></span><div><strong>" + esc(x.message) + "</strong><p>" + esc(x.time) + " · 시연 이력</p></div></div>";
    }).join("") + "</div>";
  }
  function renderReviews() {
    if (!state.docs) return empty("검토할 초안이 없습니다", "먼저 보안 서류 초안을 생성해주세요.", "문서 초안으로 이동", state.analysis ? "questions" : "intake");
    const stages = E.activeStages(pack(), state.project), tasks = reviewTasks();
    const current = E.currentStage(pack(), state.project, state.tasks);
    return header("STEP 04 · HUMAN-IN-THE-LOOP", "전문가의 검토 의견을 한곳에서 관리합니다", "서류를 담당자에게 검토 요청하고 보완 의견을 기록합니다. 실제 메시지 전송이나 승인은 발생하지 않습니다.",
      "<span class='tag blue'>협업 시연</span>") +
      "<div class='panel' style='margin-bottom:18px'><div class='panel-header' style='margin-bottom:12px'><div><h2>" + esc(pack().name) + " 처리 절차</h2><p>" + stages.length + "개 단계 · " + tasks.length + "개 담당 역할. 각 단계의 지정 역할이 모두 완료되어야 다음 단계가 열립니다.</p></div>" +
      "<span class='tag " + (allReviewed() ? "green" : "gray") + "'>" + (allReviewed() ? "모의 검토 완료" : state.reviewRequested ? "검토 진행 중" : "아직 요청 전") + "</span></div>" +
      "<div class='panel-footer' style='border:0;padding-top:0'><span class='footer-note'>검토 요청 버튼은 내부 시연 상태만 변경합니다. 실제 담당자에게 알림을 보내지 않습니다.</span>" +
      "<button class='btn btn-primary' data-action='request-review' " + (state.reviewRequested ? "disabled" : "") + ">" + icon("send", 15) + " 모의 검토 요청</button></div></div>" +
      (state.rework ? "<div class='callout gold' style='margin-bottom:20px'><span class='callout-symbol'>!</span><div><p><b>보완 요청으로 검토가 일시 중지되었습니다.</b> 추가 질문에서 내용을 보완하고 문서를 다시 생성하면 기존 검토를 초기화합니다. 내용 변경이 필요 없는 의견 확인 건은 아래 버튼으로 재검토를 요청할 수 있습니다.</p><div class='pill-row' style='margin-top:12px'><button class='btn btn-secondary btn-small' data-action='nav' data-page='questions'>내용 보완하기</button><button class='btn btn-warning btn-small' data-action='resubmit-review'>의견 확인 · 재검토 요청</button></div></div></div>" : "") +
      stages.map(function (stage, index) {
        const stageTasks = tasks.filter(function (t) { return t.stageId === stage.id; });
        const done = stageTasks.every(function (t) { return record(t).status === "approved"; }) && !stage.pendingCondition;
        const locked = current >= 0 && index > current;
        return "<section class='review-stage" + (done ? " done" : locked ? " locked" : "") + "'><div class='review-stage-header'><span class='review-stage-number'>" + (done ? "✓" : index + 1) + "</span><div><h2>" + esc(stage.title) + "</h2><p>" + (stage.roles.length > 1 ? "병렬 검토 · 지정 역할 모두 완료" : "순차 검토") + " · " + E.conditions[stage.condition] + "</p></div><span class='tag " + (done ? "green" : locked ? "gray" : "blue") + "'>" + (stage.pendingCondition ? "실행 조건 확인 필요" : done ? "단계 완료" : locked ? "선행 단계 대기" : state.reviewRequested ? "현재 단계" : "요청 전") + "</span></div><div class='review-grid'>" +
          stageTasks.map(reviewerCard).join("") + "</div></section>";
      }).join("") +
      (pack().workflow.length > stages.length ? "<div class='callout' style='margin-bottom:18px'><span class='callout-symbol'>i</span><p>현재 응답과 일치하지 않는 조건부 단계 " + (pack().workflow.length - stages.length) + "개는 제외되었습니다. 이는 기관의 시연 설정에 따른 분기이며 실제 면제 판정이 아닙니다.</p></div>" : "") +
      "<div class='split-grid' style='margin-top:18px'><section class='panel'><div class='panel-header'><div><h3>보완사항 통합 관리</h3><p>모의 보완 요청은 아래 이력에 기록됩니다.</p></div></div>" +
      "<div class='overview-summary'><div class='summary-title'>현재 상태</div><div class='info-key'><span>담당 역할별 완료</span><strong>" + tasks.filter(function (t) { return record(t).status === "approved"; }).length + " / " + tasks.length + "</strong></div>" +
      "<div class='info-key'><span>사용자 최종 확인</span><strong>" + (state.confirmed ? "완료" : "대기") + "</strong></div></div>" +
      "<div class='panel-footer'><button class='btn btn-secondary' data-action='nav' data-page='documents'>← 문서 수정·점검</button>" +
      "<button class='btn btn-primary' data-action='nav' data-page='submission'>최종 제출 관리 " + icon("arrow", 15) + "</button></div></section>" +
      "<aside class='panel'><div class='panel-header'><div><h3>최근 활동 이력</h3><p>프로젝트별 감사 추적을 위한 UI 예시입니다.</p></div></div>" + renderTimeline() + "</aside></div>" + demoNotice();
  }

  function canPrepare() {
    return state.docs && allReviewed() && state.confirmed && state.checks !== null && state.checks.length === 0 && makeChecks().length === 0;
  }
  function readiness(label, description, done) {
    return "<div class='readiness-row'><span class='ready-icon" + (done ? " done" : "") + "'>" + (done ? "✓" : "○") + "</span><div><strong>" + label + "</strong><p>" + description + "</p></div><span class='readiness-state" + (done ? " done" : "") + "'>" + (done ? "완료" : "대기") + "</span></div>";
  }
  function renderSubmission() {
    if (!state.docs) return empty("제출 대상 프로젝트가 없습니다", "보안 서류 초안을 작성한 뒤 검토와 제출 단계를 진행해주세요.", "처음부터 시작", "intake");
    const checked = state.checks !== null && state.checks.length === 0;
    const both = allReviewed();
    const tasks = reviewTasks();
    return header("STEP 05 · FINALIZATION", "검토부터 제출 준비까지 한눈에", "필수 확인 항목과 문서 준비 상태를 보고 시연용 최종 서류 패키지를 생성합니다.",
      "<span class='tag " + (state.prepared ? "green" : "gray") + "'>" + (state.prepared ? "패키지 준비 완료" : "제출 전 점검") + "</span>") +
      (state.prepared ? "<div class='result-banner' style='margin-bottom:20px'><strong>✓ 제출 패키지가 준비되었습니다</strong><p>시연용 HTML 파일을 다운로드할 수 있습니다. 실제 기관 제출·전자결재·승인과는 연결되어 있지 않습니다.</p></div>" : "") +
      "<div class='submit-grid'><section class='panel'><div class='panel-header'><div><h2>제출 준비 체크리스트</h2><p>자동 검사 결과와 담당자 검토 상태를 확인해주세요.</p></div><span class='tag blue'>WORKFLOW STATUS</span></div>" +
      "<div class='readiness'>" +
      readiness("기관 양식 " + templates().length + "종 생성", esc(pack().name) + " · 설정 v" + pack().version + " 기준", state.docs) +
      readiness("필수 항목·정합성 점검", "기관 필수값·조건 미확정·비교 항목 충돌 없음", checked) +
      tasks.map(function (t) { return readiness(esc(t.stageTitle + " · " + E.roles[t.role].short), "기관 설정에 따른 모의 검토", record(t).status === "approved"); }).join("") +
      readiness("프로젝트 담당자 최종 확인", "모든 내용을 읽고 승인 요청 전 점검", state.confirmed) +
      "</div><hr class='small-divider'/>" +
      "<label class='checkbox-row'><input type='checkbox' id='confirm-final' " + (state.confirmed ? "checked" : "") + "/><span>생성된 내용과 보완 의견을 확인했습니다. 이 체크는 시연용 사용자 확인이며 공식 승인 효력이 없습니다.</span></label>" +
      "<div class='panel-footer' style='margin-top:23px'><button class='btn btn-secondary' data-action='nav' data-page='reviews'>← 협업 검토로</button>" +
      "<button class='btn btn-primary' data-action='prepare' " + (!canPrepare() ? "disabled" : "") + ">" + icon("download", 15) + " 제출 패키지 생성</button></div></section>" +
      "<aside><div class='panel'><div class='panel-header'><div><h3>프로젝트 현황</h3><p>현재 상태를 요약한 시연 대시보드</p></div></div>" +
      "<div class='status-block'><div class='label'>OVERALL PROGRESS</div><strong>" + (state.prepared ? "제출 패키지 준비 완료" : both ? "최종 확인 단계" : "담당자 검토 단계") + "</strong>" +
      "<p>정식 제출 여부는 별도의 기관 승인·전자결재 절차에서 확정됩니다.</p></div>" +
      "<div class='info-key'><span>프로젝트명</span><strong>" + esc(state.project.name) + "</strong></div>" +
      "<div class='info-key'><span>적용 설정</span><strong>" + esc(pack().name) + " · v" + pack().version + "</strong></div>" +
      "<div class='info-key'><span>초안 문서</span><strong>" + templates().length + "종</strong></div>" +
      "<div class='info-key'><span>담당자 검토</span><strong>" + tasks.filter(function (t) { return record(t).status === "approved"; }).length + " / " + tasks.length + "</strong></div>" +
      "<div class='info-key'><span>정합성 점검</span><strong>" + (state.checks === null ? "미실행" : state.checks.length + "개 확인 사항") + "</strong></div>" +
      "<div class='pill-row' style='margin-top:17px'><button class='btn btn-secondary btn-small' data-action='download' data-kind='bundle'>" + icon("download", 14) + " 현재 서류 미리 내려받기</button></div></div>" +
      "<div class='callout green' style='margin-top:16px'><span class='callout-symbol'>" + icon("shield", 19) + "</span><p>최종 목표는 단순 서류 출력이 아니라 담당자와 신청자가 보완 이력·정책 근거·제출 상태를 안전하게 관리하는 것입니다.</p></div></aside></div>" +
      "<div class='panel' style='margin-top:18px'><div class='panel-header'><div><h3>프로젝트 활동 기록</h3><p>시연 중 발생한 주요 변경과 검토 결과</p></div></div>" + renderTimeline() + "</div>" + demoNotice();
  }
  function empty(title, description, actionLabel, target) {
    return "<div class='empty'><div class='empty-icon'>" + icon("docs", 28) + "</div><h2>" + title + "</h2><p>" + description + "</p><button class='btn btn-primary' data-action='nav' data-page='" + target + "'>" + actionLabel + " " + icon("arrow", 16) + "</button></div>";
  }
  function render() {
    renderNav();
    const root = document.getElementById("app");
    const views = { overview: renderOverview, intake: renderIntake, questions: renderQuestions, documents: renderDocuments, reviews: renderReviews, submission: renderSubmission, settings: admin.render };
    root.innerHTML = (state.current !== "settings" && state.current !== "overview" ? configBanner() : "") + (views[state.current] || views.overview)();
  }
  function switchInstitution(id) {
    if (!institutions.ids().includes(id)) return false;
    if (id === state.agencyId) return true;
    if ((state.analysis || state.docs) && !window.confirm("기관을 변경하면 기존 서류·검토·기관 전용 입력값이 초기화됩니다. 공통 프로젝트 정보는 유지할까요?")) { renderNav(); return false; }
    const project = state.project, sample = state.sample, current = state.current;
    state = makeState(id); state.project = project; state.sample = sample;
    state.current = ["overview", "settings", "intake"].includes(current) ? current : "intake";
    addHistory(institutions.published(id).name + " 설정으로 전환했습니다");
    toast("신청 기관을 변경했습니다. 분석 시 해당 기관의 최신 게시본을 적용합니다.");
    render(); return true;
  }
  function handleAction(button) {
    const action = button.dataset.action;
    if (action === "nav") return go(button.dataset.page);
    if (action === "manage-current") { admin.selectOrg(state.agencyId); return go("settings"); }
    if (action === "use-agency") { if (switchInstitution(button.dataset.agency)) go("intake"); return; }
    if (action === "apply-latest") {
      if (!window.confirm("최신 기관 설정을 현재 신청에 적용할까요? 생성 서류·검토·최종 확인이 초기화됩니다. 기존 공통 입력값은 유지됩니다.")) return;
      state.configSnapshot = institutions.published(state.agencyId); resetDownstream(); state.analysis = true;
      addHistory("기관 설정 v" + state.configSnapshot.version + "을 명시적으로 적용했습니다");
      toast("최신 설정을 적용했습니다. 추가 질문을 확인한 뒤 서류를 다시 생성해주세요.");
      return go("questions");
    }
    if (action === "start-sample") {
      state = makeState(state.agencyId); state.sample = true; state.project = sampleProject();
      addHistory("샘플 프로젝트를 불러왔습니다"); toast("샘플 프로젝트를 불러왔습니다. 분석부터 시연해보세요."); return go("intake");
    }
    if (action === "start-blank") { state = makeState(state.agencyId); return go("intake"); }
    if (action === "analyze") {
      if (!state.project.name.trim() || state.project.description.trim().length < 15) {
        return toast("프로젝트명과 15자 이상의 개요를 입력해주세요.", true);
      }
      if (!state.configSnapshot) state.configSnapshot = institutions.published(state.agencyId);
      state.analysis = true; resetDownstream(); addHistory("기관 설정 v" + pack().version + " 기준으로 프로젝트 개요 분석을 완료했습니다(시연)");
      toast("분석이 완료되었습니다. 추가 질문을 확인해보세요."); return go("questions");
    }
    if (action === "choose") {
      state.project[button.dataset.field] = button.dataset.value;
      resetDownstream(); return render();
    }
    if (action === "generate") {
      if (!templates().length) return toast("현재 조건에 적용되는 양식이 없습니다. 기관별 설정을 확인해주세요.", true);
      clearReviews();
      state.docs = true; state.securityPort = state.project.port;
      state.checks = null; state.docTab = templates()[0].id;
      addHistory(pack().name + "의 " + templates().length + "종 양식으로 초안을 생성했습니다(시연)");
      toast("기관 양식 " + templates().length + "종 초안이 생성되었습니다."); return go("documents");
    }
    if (action === "doc-tab") { state.docTab = button.dataset.kind; return render(); }
    if (action === "inject-conflict") {
      if (!conflictAvailable()) return;
      const p = String(state.project.port || "443");
      clearReviews();
      state.securityPort = p === "8080" ? "443" : "8080";
      state.docTab = templates().find(function (t) { return t.kind === "security"; }).id; state.checks = null;
      addHistory("포트 불일치 시연으로 검토·최종 확인을 초기화했습니다");
      toast("시연용 불일치를 만들었습니다. 정합성 점검을 눌러보세요."); return render();
    }
    if (action === "check-docs") {
      state.checks = makeChecks(); addHistory("문서 간 정합성 점검을 실행했습니다(시연)");
      toast(state.checks.length ? state.checks.length + "개의 확인 사항이 발견되었습니다." : "현재 입력된 비교 항목에서 불일치가 없습니다.", !!state.checks.length);
      return render();
    }
    if (action === "fix-port") {
      clearReviews();
      state.securityPort = state.project.port; state.checks = makeChecks();
      addHistory("문서 간 포트값 불일치 수정안을 적용했습니다(시연)");
      toast("보안성 검토서의 포트값을 일치시켰습니다."); return render();
    }
    if (action === "download") return downloadDocument(button.dataset.kind);
    if (action === "request-review") {
      if (state.checks === null) return toast("먼저 문서 정합성 점검을 실행해주세요.", true);
      if (state.checks.some(function (x) { return x.mismatch; })) return toast("포트 불일치를 수정한 뒤 검토를 요청해주세요.", true);
      state.reviewRequested = true;
      reviewTasks().forEach(function (t) { record(t).status = "requested"; });
      addHistory(pack().name + "의 처리 절차에 따라 모의 검토를 요청했습니다");
      toast("기관 절차의 첫 단계에 모의 검토를 요청했습니다(실제 전송 없음)."); return render();
    }
    if (action === "resubmit-review") {
      if (!state.rework) return;
      reviewTasks().forEach(function (t) { if (record(t).status === "changes") record(t).status = "requested"; });
      state.rework = false; state.confirmed = false; state.prepared = false;
      addHistory("보완 의견 확인 후 변경 없이 재검토를 요청했습니다(시연)");
      toast("보완 요청 단계에서 검토를 재개합니다."); return render();
    }
    if (action === "review-change" || action === "review-approve") {
      const key = button.dataset.reviewer;
      const task = reviewTasks().find(function (t) { return t.id === key; });
      if (!task || state.rework || !E.canAct(key, pack(), state.project, state.tasks, state.reviewRequested)) return toast("모의 요청 및 선행 단계·실행 조건을 먼저 확인해주세요.", true);
      if (action === "review-approve" && makeChecks().length) return toast("필수값·조건 미확정·문서 충돌을 해결한 후 완료로 표시해주세요.", true);
      const reviewer = record(task);
      if (reviewer.status === "approved") return;
      const fallback = E.roles[task.role].short + " 검토에 필요한 입력 항목과 근거를 추가 확인해주세요.";
      if (action === "review-change") {
        reviewer.status = "changes"; if (!reviewer.note.trim()) reviewer.note = fallback;
        state.rework = true; state.confirmed = false; state.prepared = false;
        addHistory(E.roles[task.role].short + " 담당자가 보완 요청을 등록했습니다(시연)");
      } else {
        reviewer.status = "approved";
        if (!reviewer.note.trim()) reviewer.note = "제공된 모의자료를 기준으로 검토를 완료했습니다.";
        state.confirmed = false; state.prepared = false;
        addHistory(E.roles[task.role].short + " 담당자가 " + task.stageTitle + " 검토 완료를 기록했습니다(시연)");
      }
      toast(action === "review-change" ? "보완 요청이 기록되었습니다." : "모의 검토 완료를 기록했습니다."); return render();
    }
    if (action === "prepare") {
      if (!canPrepare()) return toast("필수 항목 점검, 기관의 모든 검토 단계 및 최종 확인이 필요합니다.", true);
      state.prepared = true;
      addHistory("제출 패키지를 준비했습니다(시연)");
      downloadDocument("bundle"); toast("제출 패키지를 생성했습니다. 실제 제출은 수행되지 않았습니다."); return render();
    }
  }
  function exportPage(title, body) {
    return "<!DOCTYPE html><html lang='ko'><head><meta charset='utf-8'><title>" + esc(title) +
      "</title><style>body{font-family:'Malgun Gothic',sans-serif;background:#edf1f6;padding:24px;color:#28394b}.paper{max-width:760px;margin:22px auto;background:#fff;padding:35px;border:1px solid #dce3eb;overflow-wrap:anywhere}.paper-header{text-align:center;border-bottom:2px solid #1e344f;padding-bottom:20px}.paper-title{font-size:24px}.paper-eyebrow{font-size:10px;color:#8797ab}.paper-stamp{text-align:right;font-size:10px;color:#8294a7;margin-top:10px}.paper-section{margin-top:22px}.paper-section h4{border-left:3px solid #2769cc;padding-left:8px}.paper table{width:100%;border-collapse:collapse;font-size:12px}.paper td,.paper th{border:1px solid #dce4ec;padding:11px;text-align:left;vertical-align:top;word-break:break-word}.paper th{width:30%;background:#f5f7fa}.paper-field{margin-top:20px;border-bottom:1px solid #e5ebf1;padding-bottom:15px;font-size:13px;line-height:1.8}.paper-field h4{font-size:13px;color:#345b85;margin:0 0 8px}.paper-review-meta{margin-top:7px;color:#6e8092;font-size:11px}.paper-note{background:#f5f7fa;padding:13px;color:#6e8092;font-size:11px;margin-top:24px}.unknown{color:#aa6a15;font-weight:bold}.export-heading{text-align:center;color:#486786;font-size:18px;margin-top:30px}@media print{body{padding:0;background:white}.paper{border:0;box-shadow:none;page-break-after:always}}</style></head><body>" +
      body + "</body></html>";
  }
  function downloadDocument(kind) {
    if (!state.docs) return toast("먼저 문서를 생성해주세요.", true);
    const t = templates().find(function (form) { return form.id === kind; });
    if (kind !== "bundle" && !t) return toast("다운로드할 양식을 찾지 못했습니다.", true);
    const title = kind === "bundle" ? "서류패키지" : t.title;
    const filename = (pack().name + "_v" + pack().version + "_" + title).replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").slice(0, 110) + "_시연용.html";
    const body = kind === "bundle" ? "<div class='export-heading'>" + esc(pack().name) + " · 설정 v" + pack().version + " · " + (state.prepared ? "제출 준비 완료(시연)" : "검토 중 초안") + " · 공식 제출용 아님</div>" + templates().map(function (form) { return paper(form.id); }).join("") : paper(kind);
    const blob = new Blob([exportPage("보안길잡이 AI - " + filename, body)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    toast("HTML 초안 파일을 내려받았습니다.");
  }
  document.addEventListener("click", function (event) {
    const adminButton = event.target.closest("[data-admin-action]");
    if (adminButton && !adminButton.disabled) return admin.click(adminButton);
    const button = event.target.closest("[data-action]");
    if (button && !button.disabled) handleAction(button);
  });
  document.addEventListener("input", function (event) {
    const target = event.target;
    if (state.current === "settings") return admin.input(target);
    if (target.matches("[data-field]")) {
      state.project[target.dataset.field] = target.value;
      if (state.current === "intake") { state.analysis = false; resetDownstream(); }
      else if (state.current === "questions") resetDownstream();
    }
    if (target.matches("[data-custom]")) { state.custom[target.dataset.custom] = target.value; resetDownstream(); }
    if (target.matches("[data-review-note]")) {
      const task = reviewTasks().find(function (t) { return t.id === target.dataset.reviewNote; });
      if (task && E.canAct(task.id, pack(), state.project, state.tasks, state.reviewRequested) && !state.rework && record(task).status !== "approved") record(task).note = target.value;
    }
  });
  document.addEventListener("change", function (event) {
    const target = event.target;
    if (target.id === "institution-switch") return switchInstitution(target.value);
    if (state.current === "settings") { admin.change(target); return; }
    if (target.id === "confirm-final") { state.confirmed = target.checked; state.prepared = false; return render(); }
    if (target.matches("select[data-field]")) {
      state.project[target.dataset.field] = target.value; resetDownstream(); return;
    }
    if (target.id === "file-input" && target.files && target.files[0]) {
      const file = target.files[0];
      if (!/\.(txt|md)$/i.test(file.name) || file.size > 1024 * 1024) return toast("1MB 이하의 .txt 또는 .md 파일만 불러올 수 있습니다.", true);
      const reader = new FileReader();
      const targetState = state, job = ++projectFileRead;
      reader.onload = function () {
        if (state !== targetState || job !== projectFileRead) return;
        state.project.description = String(reader.result).slice(0, 30000);
        state.analysis = false; resetDownstream();
        toast("텍스트 개요서를 브라우저에서 불러왔습니다."); render();
      };
      reader.onerror = function () { if (state === targetState && job === projectFileRead) toast("파일을 읽지 못했습니다. 다시 선택하거나 내용을 붙여 넣어주세요.", true); };
      reader.readAsText(file, "UTF-8");
    }
  });
  document.getElementById("reset-demo").addEventListener("click", function () {
    if (window.confirm("현재 프로젝트·서류·검토 상태를 초기화할까요? 저장된 기관 설정은 유지됩니다.")) {
      state = makeState(state.agencyId); toast("프로젝트 시연이 초기화되었습니다. 기관 설정은 유지됩니다."); go("overview");
    }
  });
  document.getElementById("mobile-menu").addEventListener("click", function () {
    const sidebar = document.getElementById("sidebar");
    const opening = !sidebar.classList.contains("open");
    sidebar.classList.toggle("open");
    this.setAttribute("aria-label", opening ? "메뉴 닫기" : "메뉴 열기");
  });
  render();
})();
