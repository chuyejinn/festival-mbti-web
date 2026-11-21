const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const resources = path.join(root, 'src/main/resources');
const output = path.join(root, 'dist/netlify');

function buildStaticSite(destination) {
    fs.mkdirSync(destination, { recursive: true });
    fs.cpSync(path.join(resources, 'static'), destination, {
        recursive: true,
        filter: source => path.basename(source) !== '.DS_Store'
    });

    for (const page of ['index', 'question', 'result']) {
        fs.copyFileSync(
            path.join(resources, 'templates', `${page}.html`),
            path.join(destination, `${page}.html`)
        );
    }
}

if (require.main === module) {
    // Reset only the generated publish directory; the source files are untouched.
    fs.rmSync(output, { recursive: true, force: true });
    buildStaticSite(output);
    console.log(`Netlify publish directory prepared: ${output}`);
}

module.exports = { buildStaticSite };
