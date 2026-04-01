import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(__dirname, "../data/workcare-legal-bundles.json");

const apiKey = process.env.LAW_OC || process.argv[2];

if (!apiKey) {
  throw new Error("LAW_OC 환경변수 또는 첫 번째 인자로 API 키를 전달하세요.");
}

function resolveGlobalPackageFile(relativePath) {
  const npmRoot = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
  return pathToFileURL(path.join(npmRoot, "korean-law-mcp", relativePath)).href;
}

const [
  { LawApiClient },
  { buildJO },
  { flattenContent, extractHangContent, cleanHtml },
  { extractTag },
] = await Promise.all([
  import(resolveGlobalPackageFile("build/lib/api-client.js")),
  import(resolveGlobalPackageFile("build/lib/law-parser.js")),
  import(resolveGlobalPackageFile("build/lib/article-parser.js")),
  import(resolveGlobalPackageFile("build/lib/xml-parser.js")),
]);

const client = new LawApiClient({ apiKey });

const scenarioMap = {
  accident: {
    title: "업무 중 사고 대응",
    summary: "사고 직후에는 업무 관련성, 휴게·안전 조치, 부상 기록을 묶어서 확인해야 합니다.",
    caution: "아래 조문은 현장 사고 대응의 출발점입니다. 실제 적용은 계약 구조와 지휘감독 관계에 따라 달라질 수 있습니다.",
    laws: [
      { lawName: "근로기준법", article: "제54조", why: "휴게시간 보장 여부와 현장 대기 구조를 함께 보려는 목적입니다." },
      { lawName: "근로기준법", article: "제78조", why: "업무상 부상 시 요양보상 흐름을 이해하기 위한 조문입니다." },
      { lawName: "산업안전보건법", article: "제128조의2", why: "휴게시설 설치 의무와 현장 휴게환경 책임을 확인하기 위한 조문입니다." },
      { lawName: "산업안전보건법 시행령", article: "제96조의2", why: "휴게시설 의무 대상과 세부 기준 범위를 확인하기 위한 조문입니다." },
    ],
  },
  payment: {
    title: "보수·정산 미지급",
    summary: "체불이나 미지급은 돈의 성격, 지급 시점, 공제 주체를 먼저 쪼개야 구조가 보입니다.",
    caution: "근로기준법 조문이 중심이지만, 실제로는 임금인지 정산금인지에 따라 출발점이 달라질 수 있습니다.",
    laws: [
      { lawName: "근로기준법", article: "제36조", why: "관계 종료 후 금품 청산 시점을 확인하기 위한 조문입니다." },
      { lawName: "근로기준법", article: "제43조", why: "임금 전액·직접·정기 지급 원칙을 확인하기 위한 조문입니다." },
      { lawName: "근로기준법", article: "제44조", why: "도급 구조에서 임금 지급 책임을 검토하기 위한 조문입니다." },
      { lawName: "근로기준법", article: "제48조", why: "정산·임금명세 기록의 존재 여부를 확인하기 위한 조문입니다." },
    ],
  },
  contract: {
    title: "계약 전 리스크 점검",
    summary: "계약 단계에서는 해지 권한, 책임 전가, 근로조건 명시, 위약금 조항이 핵심 위험 신호입니다.",
    caution: "아래 조문은 근로계약을 전제로 한 규정이 포함돼 있습니다. 위수탁·도급 구조라도 실질 종속성이 있으면 검토 가치가 있습니다.",
    laws: [
      { lawName: "근로기준법", article: "제17조", why: "근로조건 명시가 빠진 계약 구조를 점검하기 위한 조문입니다." },
      { lawName: "근로기준법", article: "제19조", why: "약정한 조건 위반 시 근로자의 대응 출발점을 보기 위한 조문입니다." },
      { lawName: "근로기준법", article: "제20조", why: "과도한 위약금·손해배상 예정 조항을 경계하기 위한 조문입니다." },
      { lawName: "근로기준법", article: "제23조", why: "일방적 종료나 해고 제한을 검토하기 위한 기준 조문입니다." },
    ],
  },
};

function formatDate(raw) {
  if (!raw || typeof raw !== "string") {
    return "";
  }
  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  return raw;
}

function parseLawSearch(xmlText) {
  const lawRegex = /<law[^>]*>([\s\S]*?)<\/law>/g;
  const items = [];
  let match;

  while ((match = lawRegex.exec(xmlText)) !== null) {
    const content = match[1];
    const lawName = extractTag(content, "법령명한글");
    if (!lawName) {
      continue;
    }
    items.push({
      lawName,
      lawId: extractTag(content, "법령ID"),
      mst: extractTag(content, "법령일련번호"),
      promulgationDate: extractTag(content, "공포일자"),
      lawType: extractTag(content, "법령구분명"),
    });
  }

  return items;
}

async function resolveLaw(lawName) {
  const xmlText = await client.searchLaw(lawName, apiKey);
  const candidates = parseLawSearch(xmlText);
  const exact = candidates.find((item) => item.lawName === lawName);

  if (exact) {
    return exact;
  }

  const partial = candidates.find((item) => item.lawName.includes(lawName) || lawName.includes(item.lawName));

  if (!partial) {
    throw new Error(`법령 검색 결과를 찾지 못했습니다: ${lawName}`);
  }

  return partial;
}

function extractArticleBody(unit) {
  let mainContent = "";
  const rawContent = unit.조문내용;

  if (rawContent) {
    const contentStr = flattenContent(rawContent);
    if (contentStr) {
      const headerMatch = contentStr.match(/^(제\d+조(?:의\d+)?\s*(?:\([^)]+\))?)[\s\S]*/);
      if (headerMatch) {
        const bodyPart = contentStr.substring(headerMatch[1].length).trim();
        mainContent = bodyPart || contentStr;
      } else {
        mainContent = contentStr;
      }
    }
  }

  let paragraphContent = "";
  if (unit.항) {
    paragraphContent = extractHangContent(unit.항);
  }

  const merged = mainContent ? `${mainContent}${paragraphContent ? `\n${paragraphContent}` : ""}` : paragraphContent;
  return cleanHtml(merged);
}

async function fetchArticleRecord({ lawName, article, why }) {
  const resolved = await resolveLaw(lawName);
  const jo = buildJO(article);
  const raw = await client.getLawText({
    mst: resolved.mst,
    jo,
    apiKey,
  });
  const data = JSON.parse(raw);
  const law = data.법령;
  const basicInfo = law.기본정보 || {};
  const rawUnits = law.조문?.조문단위;
  const units = Array.isArray(rawUnits) ? rawUnits : rawUnits ? [rawUnits] : [];
  const articleUnit = units.find((unit) => unit.조문여부 === "조문");

  if (!articleUnit) {
    throw new Error(`${lawName} ${article} 조문을 찾지 못했습니다.`);
  }

  const articleTitle = articleUnit.조문제목 ? `${article}(${articleUnit.조문제목})` : article;
  const body = extractArticleBody(articleUnit);
  const snippet = body.length > 220 ? `${body.slice(0, 220).trim()}...` : body;

  return {
    lawName: basicInfo.법령명_한글 || resolved.lawName,
    lawId: basicInfo.법령ID || resolved.lawId,
    mst: resolved.mst,
    lawType: basicInfo.법종구분?.content || resolved.lawType || "",
    promulgationDate: formatDate(basicInfo.공포일자 || resolved.promulgationDate),
    effectiveDate: formatDate(basicInfo.시행일자),
    article,
    articleTitle,
    articleKey: articleUnit.조문키 || "",
    why,
    snippet,
    body,
  };
}

async function buildScenarioBundle([modeKey, config]) {
  const laws = [];
  for (const definition of config.laws) {
    laws.push(await fetchArticleRecord(definition));
  }

  return [
    modeKey,
    {
      title: config.title,
      summary: config.summary,
      caution: config.caution,
      laws,
    },
  ];
}

async function main() {
  const modeEntries = await Promise.all(Object.entries(scenarioMap).map(buildScenarioBundle));
  const bundle = {
    generatedAt: new Date().toISOString(),
    source: {
      provider: "법제처 국가법령정보 공동활용 Open API",
      generatedWith: "korean-law-mcp",
      note: "정적 GitHub Pages 배포를 위해 API 응답을 사전 생성한 JSON 번들입니다.",
    },
    modes: Object.fromEntries(modeEntries),
  };

  await fs.writeFile(outputPath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
  console.log(`Generated ${outputPath}`);
}

await main();
