"""Research Aspirant 정적 사이트 빌드.

  python tools/build.py

· tools/src 의 템플릿에서 {{L:이름}} {{M:스타일:이름}} 아이콘 자리표시자를 인라인 SVG 로 바꾸고
· 페이지에 실제로 쓰인 글자만 남겨 나눔/Noto/D2Coding 글꼴을 woff2 로 서브셋하고
· 사이트 루트(index.html, assets/)에 결과를 쓴다.
"""
import re
import shutil
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools" / "src"
ASSETS = ROOT / "assets"
BASE = ROOT.parent.parent  # ...\새 폴더 (2)
ICON_DIR = BASE / "free icon"
FONT_DIR = BASE / "나눔 글꼴"

# ───────────────────────── 글꼴 정의 ─────────────────────────
# (CSS family, [(파일명, weight 또는 None=가변축 사용)])
FONTS = [
    ("RA Neo", [("NanumSquareNeo-Variable.ttf", None)]),
    ("RA Barun", [("NanumBarunGothicLight.ttf", 300), ("NanumBarunGothic.ttf", 400), ("NanumBarunGothicBold.ttf", 700)]),
    ("RA Myeongjo", [("NanumMyeongjo.ttf", 400), ("NanumMyeongjoBold.ttf", 700), ("NanumMyeongjoExtraBold.ttf", 800)]),
    ("RA Gothic", [("NanumGothicLight.ttf", 300), ("NanumGothic.ttf", 400), ("NanumGothicBold.ttf", 700), ("NanumGothicExtraBold.ttf", 800)]),
    ("RA GothicEco", [("NanumGothicEco.ttf", 400), ("NanumGothicEcoBold.ttf", 700), ("NanumGothicEcoExtraBold.ttf", 800)]),
    ("RA MyeongjoEco", [("NanumMyeongjoEco.ttf", 400), ("NanumMyeongjoEcoBold.ttf", 700), ("NanumMyeongjoEcoExtraBold.ttf", 800)]),
    ("RA Square", [("NanumSquareL.ttf", 300), ("NanumSquareR.ttf", 400), ("NanumSquareB.ttf", 700), ("NanumSquareEB.ttf", 800)]),
    ("RA Round", [("NanumSquareRoundL.ttf", 300), ("NanumSquareRoundR.ttf", 400), ("NanumSquareRoundB.ttf", 700), ("NanumSquareRoundEB.ttf", 800)]),
    ("RA Human", [("NanumHumanEL.ttf", 200), ("NanumHumanLight.ttf", 300), ("NanumHumanRegular.ttf", 400), ("NanumHumanBold.ttf", 700), ("NanumHumanEB.ttf", 800), ("NanumHumanHeavy.ttf", 900)]),
    ("RA Barunpen", [("NanumBarunpenR.ttf", 400), ("NanumBarunpenB.ttf", 700)]),
    ("RA Pen", [("NanumPen.ttf", 400)]),
    ("RA Brush", [("NanumBrush.ttf", 400)]),
    ("RA Code", [("D2Coding-Ver1.3.2-20180524-ligature.ttf", 400), ("D2CodingBold-Ver1.3.2-20180524-ligature.ttf", 700)]),
    ("RA YetSerif", [("NanumMyeongjo-YetHangul.ttf", 400)]),
    ("RA YetSans", [("NanumBarunGothic-YetHangul.ttf", 400)]),
    ("RA NotoSC", [("NotoSansSC-Variable.ttf", None)]),
    ("RA NotoTC", [("NotoSansTC-Variable.ttf", None)]),
    ("RA NotoSerifSC", [("NotoSerifSC-Variable.ttf", None)]),
    ("RA NotoSerifTC", [("NotoSerifTC-Variable.ttf", None)]),
]

LOGO = (
    '<svg class="logo" viewBox="0 0 40 40" aria-hidden="true" focusable="false">'
    '<rect width="40" height="40" rx="11" fill="#0E1726"/>'
    '<rect x="8" y="23" width="6.5" height="9" rx="1.6" fill="#F7F3EA"/>'
    '<rect x="16.75" y="16" width="6.5" height="16" rx="1.6" fill="#F7F3EA"/>'
    '<rect x="25.5" y="8" width="6.5" height="24" rx="1.6" fill="#E0A526"/>'
    '</svg>'
)

used_icons = {}  # (kind, style, name) -> Path


def icon_svg(kind, style, name, single_quote):
    if kind == "L":
        path = ICON_DIR / "lucide" / f"{name}.svg"
        cls, vb = "ic ic--l", "0 0 24 24"
    else:
        path = ICON_DIR / "material-icons" / style / f"{name}.svg"
        cls, vb = "ic", "0 0 24 24"
    if not path.exists():
        sys.exit(f"아이콘 없음: {path}")
    used_icons[(kind, style, name)] = path
    raw = path.read_text(encoding="utf-8")
    raw = re.sub(r"<!--.*?-->", "", raw, flags=re.S)
    inner = re.search(r"<svg[^>]*>(.*)</svg>", raw, re.S).group(1)
    inner = re.sub(r"\s+", " ", inner).strip()
    svg = f'<svg class="{cls}" viewBox="{vb}" aria-hidden="true" focusable="false">{inner}</svg>'
    return svg.replace('"', "'") if single_quote else svg


def inline(text, single_quote=False):
    text = text.replace("{{LOGO}}", LOGO.replace('"', "'") if single_quote else LOGO)

    def rep(m):
        kind, rest = m.group(1), m.group(2)
        if kind == "L":
            return icon_svg("L", None, rest, single_quote)
        style, name = rest.split(":")
        return icon_svg("M", style, name, single_quote)

    return re.sub(r"\{\{([LM]):([^}]+)\}\}", rep, text)


def find_font(fname):
    hits = [p for p in FONT_DIR.rglob(fname) if "OTF" not in p.parts[-2].upper() or p.suffix == ".ttf"]
    if not hits:
        sys.exit(f"글꼴 없음: {fname}")
    return hits[0]


def main():
    html = inline((SRC / "index.html").read_text(encoding="utf-8"))
    js = inline((SRC / "app.js").read_text(encoding="utf-8"), single_quote=True)
    css = (SRC / "style.css").read_text(encoding="utf-8")

    # 페이지에 쓰이는 글자 수집 (태그 제외 본문 + JS)
    text = re.sub(r"<[^>]+>", " ", html) + js + css
    chars = set(text) | {chr(c) for c in range(0x20, 0x7F)} | set("“”‘’·…–—→←×✓₩")
    chars = {c for c in chars if c.isprintable()}
    unicodes = sorted(ord(c) for c in chars)
    print(f"글자 {len(unicodes)}종")

    # CSS/HTML/JS 에서 실제로 참조하는 글꼴 가족만 남긴다
    used_fonts = [(f, files) for f, files in FONTS if f'"{f}"' in css + html + js]
    print("사용 글꼴:", ", ".join(f for f, _ in used_fonts))
    if (ASSETS / "fonts").exists():
        shutil.rmtree(ASSETS / "fonts")
    (ASSETS / "fonts").mkdir(parents=True, exist_ok=True)
    (ASSETS / "css").mkdir(parents=True, exist_ok=True)
    (ASSETS / "js").mkdir(parents=True, exist_ok=True)

    face_css = ["/* 자동 생성 — tools/build.py */"]
    total = 0
    for family, files in used_fonts:
        for fname, weight in files:
            src = find_font(fname)
            font = TTFont(str(src), lazy=True)
            wr = weight
            if weight is None:
                ax = next(a for a in font["fvar"].axes if a.axisTag == "wght")
                wr = f"{int(ax.minValue)} {int(ax.maxValue)}"
            opts = subset.Options()
            opts.flavor = "woff2"
            opts.layout_features = ["*"]
            opts.hinting = False
            opts.notdef_outline = True
            opts.name_IDs = [0, 1, 2, 3, 4, 6, 13, 14]
            opts.drop_tables += ["DSIG"]
            font = TTFont(str(src))
            sub = subset.Subsetter(opts)
            sub.populate(unicodes=unicodes)
            sub.subset(font)
            slug = re.sub(r"[^a-z0-9]+", "-", f"{family}-{wr}".lower()).strip("-")
            out = ASSETS / "fonts" / f"{slug}.woff2"
            font.flavor = "woff2"
            font.save(str(out))
            size = out.stat().st_size
            total += size
            print(f"  {out.name:34s} {size/1024:7.1f} KB")
            face_css.append(
                f'@font-face{{font-family:"{family}";src:url("../fonts/{out.name}") format("woff2");'
                f"font-weight:{wr};font-style:normal;font-display:swap}}"
            )
    print(f"글꼴 합계 {total/1024/1024:.2f} MB")
    (ASSETS / "css" / "fonts.css").write_text("\n".join(face_css) + "\n", encoding="utf-8")

    (ROOT / "index.html").write_text(html, encoding="utf-8")
    (ASSETS / "js" / "app.js").write_text(js, encoding="utf-8")
    (ASSETS / "css" / "style.css").write_text(css, encoding="utf-8")
    logo_file = LOGO.replace('class="logo" ', 'xmlns="http://www.w3.org/2000/svg" ').replace(' aria-hidden="true" focusable="false"', "")
    (ASSETS / "favicon.svg").write_text(logo_file, encoding="utf-8")
    (ASSETS / "logo.svg").write_text(logo_file, encoding="utf-8")

    # 사용한 아이콘 원본 사본
    icons_out = ASSETS / "icons"
    if icons_out.exists():
        shutil.rmtree(icons_out)
    for (kind, style, name), p in sorted(used_icons.items()):
        d = icons_out / ("lucide" if kind == "L" else f"material-{style}")
        d.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, d / f"{name}.svg")
    print(f"아이콘 {len(used_icons)}개 사용")

    # 라이선스
    lic = ROOT / "licenses"
    lic.mkdir(exist_ok=True)
    for f in (ICON_DIR / "attribution").glob("*.txt"):
        shutil.copy2(f, lic / f.name)
    for old in lic.glob("OFL-*.txt"):
        old.unlink()
    if any(f.startswith("RA Noto") for f, _ in used_fonts):
        for f in FONT_DIR.rglob("OFL-*.txt"):
            shutil.copy2(f, lic / f.name)
    print("완료")


if __name__ == "__main__":
    main()
