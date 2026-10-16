// 中文学习分支校验：比较基线与当前源码的无注释语法树输出，不执行账号任务。
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const baseline = process.argv[2] || '94db205ef476852dd306ef42fb3bbf6c17ccd97e'
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
const files = git(['ls-tree', '-r', '--name-only', baseline]).trim().split('\n')
const printer = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed })
const normalize = (name, text) => {
    const source = ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true)
    assert.equal(source.parseDiagnostics.length, 0, `Parse errors: ${name}`)
    return printer.printFile(source)
}
const directives = text => text.match(/@ts-(?:expect-error|ignore|nocheck|check)[^\r\n]*/g) || []
let checked = 0
let changed = 0
for (const file of files.filter(name => /\.(ts|js)$/.test(name))) {
    const before = git(['show', `${baseline}:${file}`]).replace(/\r\n/g, '\n')
    const after = fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n')
    assert.equal(normalize(file, after), normalize(file, before), `Executable/type syntax changed: ${file}`)
    assert.deepEqual(directives(after), directives(before), `TypeScript directives changed: ${file}`)
    if (before !== after) changed++
    checked++
}
// 配置、锁文件、许可证及 shell 脚本应保持逐字节内容（忽略 Git 换行差异）。
for (const file of files.filter(
    name => /\.(json|yaml|yml|sh)$/.test(name) || name === 'LICENSE' || name === 'Dockerfile' || name === 'env.example'
)) {
    const before = git(['show', `${baseline}:${file}`]).replace(/\r\n/g, '\n')
    const after = fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n')
    assert.equal(after, before, `Protected file changed: ${file}`)
}
console.log(
    `PASS: ${checked} source files checked; ${changed} source files contain comment-only changes; protected files unchanged.`
)
