const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildStaticSite } = require('../../../scripts/build-netlify.cjs');

const root = path.resolve(__dirname, '../../..');
const resources = path.join(root, 'src/main/resources');

test('Netlify build contains the original three pages and their referenced assets', t => {
    const destination = fs.mkdtempSync(path.join(os.tmpdir(), 'festival-netlify-'));
    t.after(() => fs.rmSync(destination, { recursive: true, force: true }));
    buildStaticSite(destination);

    for (const page of ['index', 'question', 'result']) {
        const filename = `${page}.html`;
        const html = fs.readFileSync(path.join(destination, filename), 'utf8');
        assert.equal(html, fs.readFileSync(path.join(resources, 'templates', filename), 'utf8'));
        for (const [, asset] of html.matchAll(/(?:src|href)="(\/(?:js|images)\/[^"/]+|\/style\.css)"/g)) {
            assert.ok(fs.existsSync(path.join(destination, asset)), `Missing ${asset}`);
        }
    }
    const images = fs.readdirSync(path.join(destination, 'images'));
    assert.equal(images.filter(file => file.endsWith('.png')).length, 17);
    assert.equal(images.includes('.DS_Store'), false);
    assert.equal(fs.existsSync(path.join(destination, 'application.properties')), false);
});

test('Netlify config publishes generated output and maps both Spring page routes', () => {
    const config = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8');
    assert.match(config, /publish\s*=\s*"dist\/netlify"/);
    for (const route of ['question', 'result']) {
        assert.ok(config.includes(`from = "/${route}"\n  to = "/${route}.html"\n  status = 200`));
    }
});
