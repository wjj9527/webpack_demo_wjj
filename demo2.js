const fs = require ('fs')
const parser = require ('@babel/parser')
const traverse = require ('@babel/traverse').default
const babel = require ('@babel/core')
const path = require ("path")
const {entry, output} = require ("./webpack.config")//webpack配置项
let relativeFilenames = {}
let webpackModules = {}
function createAssets(filename){
    //读取文件内容
    const content = fs.readFileSync (filename, "utf-8")
    //转化成AST对象
    const ast = parser.parse (content, {
        sourceType: 'module'//输出内容为模块，还可以选择为script，但是由于我们是使用模块化操作所以不采用script
    })

    let dependencies = []
    //分析当前文件依赖
    traverse (ast, {
        ImportDeclaration ({node}) {
            //将当前依赖推入数组，方便后面构建graph
            dependencies.push (node.source.value)
            if (!relativeFilenames[node.source.value]) {
                const dirname = path.dirname (filename)
                relativeFilenames[node.source.value] = path.join (dirname, node.source.value).replace(/\\/g,'/')
            }
        }
    })
    //转换成ES5代码
    const {code} = babel.transformFromAstSync (ast, null, {
        presets: ['@babel/preset-env'],
    })

    if (!webpackModules[filename]) {
        const dirname = path.dirname (filename)
        dependencies.forEach (item => {
            const absolutePath = path.join (dirname, item)
            createAssets (absolutePath)
        })
        webpackModules[filename] = {
            dependencies,
            code,
        }
    }
}

createAssets(entry)

function createOutputCode () {
    let codeStr = ''
    //循环模块对象构建输出模块代码对象字符串
    for (let key in webpackModules) {
        codeStr += `"${key.replace(/\\/g,'/')}":(module, exports, require)=>{
            ${webpackModules[key].code}
        },`
    }

    const outputCode = `
        (()=>{
    const pathReference = ${JSON.stringify(relativeFilenames)}
    const modules = {${codeStr}}
    const __webpack_module_cache__ = {}
    function require(moduleId){
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== undefined) {
            return cachedModule.exports;
        }
        var module = __webpack_module_cache__[moduleId] = {
            exports: {}
        };
        function requireFn(path){
            return require(pathReference[path])
        }
        modules[moduleId] (module, module.exports, requireFn);
        return module.exports;
    }
    require('${entry}')
})();
    `
    createOutputFile(outputCode)
}

createOutputCode()

function createOutputFile(code){
    //判断文件夹是否存在
    function createAction(){
        fs.writeFile(`${output.path}/main.js`,code,()=>{})
    }
    if (!fs.existsSync(output.path)) {
        fs.mkdir(output.path, (err) => {
            createAction()
        })
    }else{
        createAction()
    }
}
