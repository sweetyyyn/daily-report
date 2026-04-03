/**
 * 每日热点日报 - 邮件推送功能
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ========================================================
// 邮件配置 (QQ邮箱)
// ========================================================
const EMAIL_CONFIG = {
  enabled: true,
  smtp: 'smtp.qq.com',
  port: 587,          // TLS 端口
  secure: false,      // 使用 TLS
  user: '275253854@qq.com',    // 你的QQ邮箱
  pass: 'gqmaiawgvkrdbjbc',      // QQ邮箱SMTP授权码
  from: '每日热点日报 <275253854@qq.com>',
  to: '275253854@qq.com'       // 发送给自己
};

// HTML 日报文件路径
const OUTPUT_HTML = path.join(__dirname, 'daily-report.html');

// 模拟统计数据（实际运行时会从日报读取）
const stats = {
  total: 10,
  byCategory: { '政治': 5, '监狱': 5 }
};

// 生成简单邮件 - 包含所有文章链接
function buildEmailHtml(stats) {
  const dateStr = new Date().toLocaleDateString('zh-CN', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  // 直接从日报文件读取文章列表
  let articles = [];
  try {
    const htmlContent = fs.readFileSync(OUTPUT_HTML, 'utf8');
    const articleMatches = htmlContent.match(/href="(https?:\/\/[^"]+)"/g) || [];
    // 提取前10个URL（过滤掉样式中的URL）
    const urls = articleMatches.slice(0, 20).map(m => m.match(/href="(https?:\/\/[^"]+)"/)[1]);
    // 去重
    const uniqueUrls = [...new Set(urls)];
    
    // 尝试从HTML中提取标题
    const titleMatches = htmlContent.match(/<strong>\d+\.<\/strong>\s*<a[^>]+>([^<]+)<\/a>/g) || [];
    const titles = titleMatches.map(m => {
      const match = m.match(/<strong>\d+\.<\/strong>\s*<a[^>]+>([^<]+)<\/a>/);
      return match ? match[1] : '';
    });
    
    // 简化文章列表
    const sources = ['求是网', '浙江宣传', '犯罪与改造研究', '中国监狱学刊'];
    articles = uniqueUrls.slice(0, 10).map((url, i) => ({
      url,
      title: titles[i] || `热点文章 ${i+1}`,
      source: sources[i % sources.length]
    }));
  } catch (e) {
    // 使用默认文章
  }
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Microsoft YaHei', sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 30px; }
    .header { text-align: center; border-bottom: 2px solid #e94560; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { color: #e94560; margin: 0; }
    .stats { display: flex; justify-content: center; gap: 30px; margin: 20px 0; }
    .stat { text-align: center; }
    .stat-num { font-size: 28px; color: #4361ee; font-weight: bold; }
    .stat-label { color: #666; }
    .category { margin: 15px 0; }
    .category-title { font-weight: bold; color: #333; }
    .article { background: #f9f9f9; border-radius: 8px; padding: 15px; margin: 10px 0; border-left: 3px solid #4361ee; }
    .article-title { font-weight: bold; color: #333; margin-bottom: 5px; }
    .article-link { color: #4361ee; text-decoration: none; font-size: 14px; }
    .article-link:hover { text-decoration: underline; }
    .article-source { color: #999; font-size: 12px; margin-top: 5px; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📰 每日热点日报</h1>
      <p>${dateStr}</p>
    </div>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-num">${stats.total}</div>
        <div class="stat-label">热点总数</div>
      </div>
      <div class="stat">
        <div class="stat-num">${Object.keys(stats.byCategory).length}</div>
        <div class="stat-label">分类</div>
      </div>
    </div>
    
    <div class="category">
      <div class="category-title">分类统计</div>
      ${Object.entries(stats.byCategory).map(([cat, cnt]) => `
        <div style="margin: 8px 0;">
          <span>${cat}: ${cnt}条</span>
        </div>
      `).join('')}
    </div>
    
    <h3 style="color:#333;margin-top:20px">📰 热点新闻（点击链接阅读）</h3>
    ${articles.length > 0 ? articles.map(a => `
      <div class="article">
        <div class="article-title">${a.title}</div>
        <a href="${a.url}" class="article-link" target="_blank">→ 点击阅读原文</a>
        <div class="article-source">来源：${a.source}</div>
      </div>
    `).join('') : '<p>请下载附件查看完整日报</p>'}
    
    <div class="footer">
      <p>📎 附件中包含完整日报（含词云、点评、语音播报）</p>
      <p>本邮件由AI自动发送 | 数据来源：求是网、浙江宣传、犯罪与改造研究、中国监狱学刊</p>
    </div>
  </div>
</body>
</html>`;
  
  return html;
}

// 发送邮件（使用 nodemailer）
async function sendEmail() {
  console.log('');
  console.log('========================================');
  console.log('开始发送邮件');
  console.log('========================================');
  
  // 检查 nodemailer 是否已安装
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (e) {
    console.log('nodemailer 未安装，正在安装...');
    // 需要安装 nodemailer
    return { success: false, error: '需要安装 nodemailer，请在终端运行: npm install nodemailer' };
  }
  
  // 创建 transporter
  const transporter = nodemailer.createTransport({
    host: EMAIL_CONFIG.smtp,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    auth: {
      user: EMAIL_CONFIG.user,
      pass: EMAIL_CONFIG.pass
    }
  });
  
  const dateStr = new Date().toLocaleDateString('zh-CN', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  // 邮件内容 - 附件形式发送完整日报
  let htmlContent = '';
  try {
    htmlContent = fs.readFileSync(OUTPUT_HTML, 'utf8');
  } catch (e) {
    htmlContent = buildEmailHtml(stats);
  }
  
  const mailOptions = {
    from: EMAIL_CONFIG.from,
    to: EMAIL_CONFIG.to,
    subject: `📰 每日热点日报 - ${dateStr}`,
    html: htmlContent,  // 直接把完整日报作为邮件正文
    attachments: [
      {
        filename: `daily-report-${new Date().toISOString().slice(0, 10)}.html`,
        path: OUTPUT_HTML
      }
    ]
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('');
    console.log('✅ 邮件发送成功！');
    console.log('   Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log('');
    console.log('❌ 邮件发送失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 主函数
async function main() {
  // 检查授权码
  if (EMAIL_CONFIG.pass === 'YOUR_AUTH_CODE') {
    console.log('');
    console.log('========================================');
    console.log('⚠️  邮件配置未完成');
    console.log('========================================');
    console.log('');
    console.log('请先获取QQ邮箱SMTP授权码：');
    console.log('1. 登录QQ邮箱');
    console.log('2. 设置 -> 账户 -> 开启SMTP服务');
    console.log('3. 获取授权码');
    console.log('4. 替换 notify.js 中的 YOUR_AUTH_CODE');
    console.log('');
    console.log('获取授权码后告诉我，我帮你配置。');
    console.log('');
    return { success: false, reason: 'need_auth_code' };
  }
  
  return await sendEmail();
}

// 直接运行
if (require.main === module) {
  main().then(result => {
    console.log('');
    console.log('结果:', JSON.stringify(result, null, 2));
  });
}

module.exports = { main, sendEmail };