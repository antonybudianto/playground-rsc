const {readFileSync, writeFileSync} = require('fs');
const path = require('path');

const cwd = process.cwd();

async function generate() {
  try {
    const manifest = readFileSync(
      path.resolve(cwd, './build/react-client-manifest.json'),
      'utf8'
    );
    const moduleMap = JSON.parse(manifest);
    const moduleKeys = Object.keys(moduleMap);
    const finalMap = {};
    let str = 'const MAP = {\n';
    moduleKeys.map((k) => {
      const tmpKeys = Object.keys(moduleMap[k]);
      const obj = moduleMap[k][''] || {id: ''};
      // console.log(obj);
      if (obj.id && k.indexOf('.client.js') !== -1) {
        const relativePath = path.relative(cwd, k.replace('file://', ''));
        const newPath = '../' + relativePath;
        // console.log(newPath);
        // throw new Error('testong');
        finalMap[
          k
        ] = `  "${obj.id}": () => {try{ return require("${newPath}?inline") }catch(e){}},\n`;
        str += finalMap[k] + '\n';
      }
    });
    str += '}\n\n';
    str += 'export default MAP';
    writeFileSync(path.resolve(cwd, './build/client-manifest.js'), str, {
      encoding: 'utf-8',
    });
    console.log('MC generated. done!');
    return moduleMap;
  } catch (err) {
    console.log(
      'Could not find webpack build output. Please build client first!',
      err
    );
  }
}

module.exports = generate;

if (process.env.CI) {
  generate();
}
