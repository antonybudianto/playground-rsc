const {readFileSync, writeFileSync} = require('fs');
const path = require('path');

async function generate() {
  try {
    const manifest = readFileSync(
      path.resolve(__dirname, './build/react-client-manifest.json'),
      'utf8'
    );
    const moduleMap = JSON.parse(manifest);
    const moduleKeys = Object.keys(moduleMap);
    const finalMap = {};
    let str = 'const MAP = {\n';
    moduleKeys.map((k) => {
      const tmpKeys = Object.keys(moduleMap[k]);
      const obj = moduleMap[k][''] || {id: ''};
      if (obj.id && obj.id.indexOf('.client.js') !== -1) {
        const newPath = obj.id.replace('./', '../');
        finalMap[
          k
        ] = `  "${k}": () => {try{ return require("${newPath}?inline") }catch(e){}},\n`;
        str += finalMap[k] + '\n';
      }
    });
    str += '}\n\n';
    str += 'export default MAP';
    writeFileSync(path.resolve(__dirname, './build/client-manifest.js'), str, {
      encoding: 'utf-8',
    });
    console.log('done!');
    return moduleMap;
  } catch (err) {
    console.log(
      'Could not find webpack build output. Please build client first!',
      err
    );
  }
}

generate();
