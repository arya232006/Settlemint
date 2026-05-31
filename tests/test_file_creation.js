const fs = require('fs');

test('file creation and content', () => {
    const data = fs.readFileSync('hfhfhfhfhfhfyyfyfy.d', 'utf8');
    expect(data).toBe('hello');
});