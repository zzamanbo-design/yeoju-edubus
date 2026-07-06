const fs = require('fs');
const files = [
  'src/app/dashboard-client.tsx',
  'src/app/layout.tsx',
  'src/app/apply/print/[id]/page.tsx',
  'src/app/login/page.tsx',
  'src/app/update-password/page.tsx',
  'src/components/global-header.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf-8');
    content = content.replace(/여주 에듀버스/g, '여주 체험버스');
    fs.writeFileSync(f, content, 'utf-8');
  }
});
console.log("Done replacing.");
