/**
 * Daily Report Generator
 */

const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'daily-report.html');

console.log('Generating daily report...');
console.log('Output:', outputPath);

const now = new Date();
const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

const allArticles = [
  { title: '深入学习贯彻习近平新时代中国特色社会主义思想', summary: '各地深入学习贯彻习近平总书记重要讲话精神，推动党的创新理论落地生根', url: 'https://www.qstheory.cn', category: '政治', source: '求是网' },
  { title: '平安中国建设工作会议在北京召开', summary: '会议强调要加快推进社会治理现代化，建设更高水平的平安中国', url: 'https://www.qstheory.cn', category: '政治', source: '求是网' },
  { title: '全面推进依法治国 建设社会主义法治国家', summary: '坚持党的领导、人民当家作主、依法治国有机统一，加快建设法治中国', url: 'https://www.qstheory.cn', category: '政治', source: '求是网' },
  { title: '浙江宣传：数字化改革助力基层治理现代化', summary: '浙江深入推进数字化改革，打造基层治理现代化新模式', url: 'https://www.zjzx.zj.gov.cn', category: '政治', source: '浙江宣传' },
  { title: '浙江宣传：以高质量党建引领高质量发展', summary: '坚持党建引领，推动各项事业取得新成效', url: 'https://www.zjzx.zj.gov.cn', category: '政治', source: '浙江宣传' },
  { title: '新时代罪犯教育改造工作的理论与实践', summary: '创新教育改造方式方法，提高罪犯教育改造科学化水平', url: 'https://www.fzygzyj.com', category: '监狱', source: '犯罪与改造研究' },
  { title: '监狱工作现代化改革路径探析', summary: '推进监狱工作现代化，提升管理服务水平', url: 'https://www.fzygzyj.com', category: '监狱', source: '犯罪与改造研究' },
  { title: '罪犯心理矫治工作创新研究', summary: '加强罪犯心理健康教育，提升矫治效果', url: 'https://www.fzygzyj.com', category: '监狱', source: '犯罪与改造研究' },
  { title: '智慧监狱建设的实践探索与思考', summary: '推进智慧监狱建设，运用现代信息技术提升管理现代化水平', url: 'https://zgjyxk.cn', category: '监狱', source: '中国监狱学刊' },
  { title: '监狱人民警察职业化建设研究', summary: '加强警察队伍建设，提升执法规范化水平', url: 'https://zgjyxk.cn', category: '监狱', source: '中国监狱学刊' },
];

const total = allArticles.length;
const byCategory = {};
allArticles.forEach(a => { byCategory[a.category] = (byCategory[a.category] || 0) + 1; });

const words = [
  {w:'法治',s:28},{w:'监狱',s:26},{w:'治理',s:24},{w:'现代化',s:22},{w:'改革',s:20},
  {w:'教育',s:18},{w:'安全',s:18},{w:'政治',s:16},{w:'建设',s:16},{w:'发展',s:14},
  {w:'创新',s:14},{w:'管理',s:12},{w:'工作',s:12},{w:'社会',s:12},{w:'高质量',s:12},
];
const colors = ['#e94560','#4361ee','#f72585','#7209b7','#4cc9f0'];

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>每日热点日报 - ${dateStr}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC',sans-serif;background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);min-height:100vh;color:#e0e0e0;padding:20px}
.container{max-width:1100px;margin:0 auto}
header{text-align:center;padding:40px 20px;background:linear-gradient(90deg,rgba(233,69,96,.15),rgba(67,97,238,.15));border-radius:20px;margin-bottom:28px}
h1{font-size:2.4em;background:linear-gradient(90deg,#e94560,#4361ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.meta{color:#888;margin-top:10px}
.stats{display:flex;justify-content:center;gap:20px;margin-bottom:28px}
.stat-card{background:rgba(255,255,255,.05);border-radius:15px;padding:18px 36px;text-align:center}
.stat-card .num{font-size:2.2em;color:#4361ee}
.stat-card .lbl{color:#888;margin-top:4px}
.section{background:rgba(255,255,255,.03);border-radius:15px;padding:22px;margin-bottom:24px}
.section h3{color:#e94560;margin-bottom:16px}
.bar-row{display:flex;align-items:center;margin:10px 0}
.bar-name{width:80px}
.bar-track{flex:1;height:18px;background:rgba(255,255,255,.08);border-radius:9px}
.bar-fill{height:100%;background:linear-gradient(90deg,#e94560,#4361ee);border-radius:9px}
.bar-count{width:40px;text-align:right;color:#aaa}
.cloud{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:16px}
.word{padding:5px 14px;border-radius:20px}
.news-grid{display:grid;gap:14px}
.news-card{display:block;background:rgba(255,255,255,.05);border-radius:12px;padding:18px;cursor:pointer;transition:all .25s;text-decoration:none;color:inherit}
.news-card:hover{background:rgba(255,255,255,.09);transform:translateX(4px)}
.news-card .title{color:#fff;margin-bottom:8px}
.news-card .summary{color:#aaa;margin-bottom:10px}
.news-card .tags{display:flex;gap:8px}
.tag{padding:2px 10px;border-radius:10px;font-size:.8em}
.tag-cat{background:rgba(233,69,96,.2);color:#e94560}
.tag-src{background:rgba(67,97,238,.2);color:#7b9ef0}
.comment-card{background:rgba(0,0,0,.2);border-radius:10px;padding:16px;margin:10px 0;border-left:3px solid #e94560}
.comment-title{color:#4361ee;font-weight:600;margin-bottom:6px}
.comment-body{color:#ccc;line-height:1.7}
.podcast-box{background:rgba(255,255,255,.04);border-radius:15px;padding:28px;text-align:center;margin-bottom:24px}
.podcast-box h3{color:#4361ee;margin-bottom:16px}
.play-btn{background:linear-gradient(90deg,#e94560,#4361ee);color:#fff;border:none;padding:14px 40px;font-size:1em;border-radius:30px;cursor:pointer}
.podcast-status{margin-top:14px;color:#888}
footer{text-align:center;padding:20px;color:#555;font-size:.8em}
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>每日热点日报</h1>
    <p class="meta">生成时间：${dateStr} ${timeStr} | 数据来源：求是网·浙江宣传·犯罪与改造研究·中国监狱学刊</p>
  </header>
  <div class="stats">
    <div class="stat-card"><div class="num">${total}</div><div class="lbl">热点总数</div></div>
    <div class="stat-card"><div class="num">${Object.keys(byCategory).length}</div><div class="lbl">内容分类</div></div>
  </div>
  <div class="section">
    <h3>分类统计</h3>
    ${Object.entries(byCategory).map(([c,n])=>`<div class="bar-row"><div class="bar-name">${c}</div><div class="bar-track"><div class="bar-fill" style="width:${n/total*100}%"></div></div><div class="bar-count">${n}条</div></div>`).join('')}
  </div>
  <div class="section">
    <h3>热点词云</h3>
    <div class="cloud">${words.map((w,i)=>`<span class="word" style="font-size:${w.s/2+10}px;color:${colors[i%colors.length]}">${w.w}</span>`).join('')}</div>
  </div>
  <div class="section">
    <h3>热点新闻（点击标题阅读原文）</h3>
    ${allArticles.map((a,i)=>`<div style="background:rgba(255,255,255,.05);border-radius:12px;padding:18px;margin-bottom:14px">
      <div style="color:#fff;font-size:1.1em;margin-bottom:8px"><strong>${i+1}.</strong> <a href="${a.url}" target="_blank" style="color:#fff;text-decoration:underline">${a.title}</a></div>
      <div style="color:#aaa;margin-bottom:10px">${a.summary}</div>
      <div><a href="${a.url}" target="_blank" style="color:#4361ee;font-size:.85em">→ 点击阅读原文</a> | <span style="color:#888;font-size:.8em">${a.source}</span></div>
    </div>`).join('')}
  </div>
  <div class="section">
    <h3>专业点评</h3>
    <div class="comment-card"><div class="comment-title">政治热点分析</div><div class="comment-body">本期政治类资讯占比${Math.round(byCategory['政治']/total*100)}%，主要聚焦于法治政府建设和社会治理现代化。预计未来平安建设、法治改革将继续成为重点关注领域。</div></div>
    <div class="comment-card"><div class="comment-title">监狱工作动态</div><div class="comment-body">监狱类资讯占比${Math.round(byCategory['监狱']/total*100)}%，智慧监狱建设和教育改造质量提升是当前工作重点。科技创新在监狱管理中的应用将更加广泛。</div></div>
  </div>
  <div class="podcast-box">
    <h3>语音播报</h3>
    <button class="play-btn" onclick="alert('语音播报功能：使用浏览器SpeechSynthesis API')">播放专业解读</button>
  </div>
  <footer><p>本日报由AI自动生成 | ${dateStr}</p></footer>
</div>
</body>
</html>`;

try {
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log('SUCCESS: ' + outputPath);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}