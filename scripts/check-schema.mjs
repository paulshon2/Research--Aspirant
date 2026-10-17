// 코드가 쓰는 테이블·컬럼이 supabase/schema.sql 에 모두 있는지 검사한다.
// usage: node scripts/check-schema.mjs   (불일치가 있으면 exit 1)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sql = fs.readFileSync(path.join(root, "supabase", "schema.sql"), "utf8");

/* 1) schema.sql → { table: Set(columns) } */
const schema = {};
for (const m of sql.matchAll(/create table if not exists public\.(\w+)\s*\(([\s\S]*?)\n\);/g)) {
  const cols = new Set();
  for (const line of m[2].split("\n")) {
    const c = line.trim().match(/^([a-z_]+)\s+(text|int|uuid|jsonb|boolean|timestamptz)/);
    if (c) cols.add(c[1]);
  }
  schema[m[1]] = cols;
}

/* 2) 소스에서 .from("t") 뒤의 select/eq/order/upsert/insert/update 를 읽는다 */
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (["node_modules", ".next", "public"].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(e.name)) files.push(p);
  }
})(root);

const problems = [];
let checked = 0;
const objKeys = (s) => [...s.matchAll(/(?:^|[{,\s])([a-z_]+)\s*:/g)].map((m) => m[1]);

for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const rel = path.relative(root, f);
  for (const m of src.matchAll(/\.from\(\s*["'](\w+)["']\s*\)/g)) {
    const table = m[1];
    const start = m.index + m[0].length;
    const tail = src.slice(start, start + 700).split(/\.from\(|;\s*\n|;\s*\w+\.from/)[0];
    checked++;
    if (!schema[table]) { problems.push(`${rel}: 테이블 없음 → ${table}`); continue; }
    const cols = schema[table];
    const used = new Set();
    for (const s of tail.matchAll(/\.select\(\s*["']([^"']*)["']/g))
      s[1].split(",").map((x) => x.trim()).filter((x) => x && x !== "*").forEach((x) => used.add(x));
    for (const s of tail.matchAll(/\.(?:eq|in|order|neq)\(\s*["']([a-z_]+)["']/g)) used.add(s[1]);
    for (const s of tail.matchAll(/onConflict:\s*["']([^"']+)["']/g)) s[1].split(",").forEach((x) => used.add(x.trim()));
    for (const s of tail.matchAll(/\.(?:upsert|insert|update)\(\s*\{([\s\S]*?)\}/g)) objKeys(s[1]).forEach((k) => used.add(k));
    for (const c of used) if (!cols.has(c)) problems.push(`${rel}: ${table}.${c} 컬럼 없음`);
  }
  /* 변수로 넘기는 row/patch/profileData 객체: 그 파일이 profiles 를 쓰면 키를 profiles 와 대조 */
  if (/\.from\(\s*["']profiles["']/.test(src)) {
    for (const m of src.matchAll(/const (?:row|patch|profileData)[^=]*=\s*\{([\s\S]*?)\n\s*\};/g))
      for (const k of objKeys(m[1])) if (!schema.profiles.has(k)) problems.push(`${rel}: profiles.${k} 컬럼 없음 (객체 키)`);
    for (const m of src.matchAll(/(?:patch|profileData|row)\.([a-z_]+)\s*=/g))
      if (!schema.profiles.has(m[1])) problems.push(`${rel}: profiles.${m[1]} 컬럼 없음 (대입)`);
  }
}

console.log(`검사한 쿼리 ${checked}개 · 스키마 테이블 ${Object.keys(schema).length}개 (${Object.keys(schema).join(", ")})`);
if (problems.length) {
  console.log("불일치:\n  " + [...new Set(problems)].join("\n  "));
  process.exit(1);
}
console.log("OK — 코드가 쓰는 테이블·컬럼이 모두 schema.sql 에 있습니다.");
