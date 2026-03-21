const fs = require('fs');

function fixJsonFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let result = '';
  let i = 0;
  let inString = false;

  while (i < content.length) {
    const ch = content[i];

    if (inString) {
      const bs = '\\';
      if (ch === bs && i + 1 < content.length) {
        result += ch + content[i + 1];
        i += 2;
        continue;
      }
      if (ch === '"') {
        let j = i + 1;
        while (j < content.length && (content[j] === ' ' || content[j] === '\t')) j++;
        const next = content[j] || '';
        if (',}'.includes(next) || next === ']' || next === '\n' || next === '\r') {
          inString = false;
          result += ch;
        } else {
          result += '\\"';
        }
        i++;
        continue;
      }
      result += ch;
      i++;
    } else {
      if (ch === '"') {
        inString = true;
        result += ch;
        i++;
      } else {
        result += ch;
        i++;
      }
    }
  }

  fs.writeFileSync(filePath, result, 'utf8');
  try {
    JSON.parse(result);
    return 'FIXED OK';
  } catch (e) {
    return 'STILL ERR: ' + e.message.slice(0, 100);
  }
}

const files = process.argv.slice(2);
for (const f of files) {
  console.log(f.split('/').slice(-3).join('/') + ': ' + fixJsonFile(f));
}
