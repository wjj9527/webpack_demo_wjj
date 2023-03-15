const fs = require('fs')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')
const path = require ("path")
let uid = 0
function  createAssets(filename = './src/index.js'){
    console.log(filename)
    //读取文件内容
    const content = fs.readFileSync(filename,"utf-8")
    // console.log(content)
    //转化成AST对象
    const ast = parser.parse(content,{
        sourceType:'module'
    })
    const dependencies = []
    //visitor
    //分析当前文件依赖
    traverse(ast,{
        ImportDeclaration ({node}) {
            // console.log(node.source.value)//当前节点信息
            dependencies.push(node.source.value)//将当前依赖推入数组
            console.log('1111',node.source.value)
        }
    })
    //转换成ES5代码
    const {code} = babel.transformFromAstSync(ast,null,{
        presets:['@babel/preset-env'],
        parserOpts: { allowReturnOutsideFunction: true },
    })
    let id = uid++
    return {
        id,
        filename,
        code,
        dependencies,
    }
}
// createAssets()
function createGraph(entry){
    const asset = createAssets(entry)
    const queue = [asset]
    console.log(asset)
    for(const val of queue){
        console.log('222',val.filename)
        const dirname = path.dirname(val.filename)
        val.mapping = {};
        val.dependencies.forEach(relativePath =>{
            const absolutePath = path.join(dirname,relativePath);
            const child = createAssets(absolutePath);
            val.mapping[relativePath] = child.id
            queue.push(child)
        })
    }
    // console.log(queue)
    return queue
}
const graph = createGraph('./src/index.js');
function  bundle(graph){
    let modules = ''
    graph.forEach(mod =>{
        modules +=`
            ${mod.id}:[
                function(require,module,exports){
                    ${mod.code}
                },
                ${JSON.stringify(mod.mapping)}
            ],
        `
    })
    const result = `(function(modules){
        function require(id){
            const [fn,mapping] = modules[id];
            function localRequire(relativePath){
                return require(mapping[relativePath])
            }
             const module = {
                 exports:{}
             }
            fn(localRequire,module,module.exports)
            return module.exports 
        }
       
        
    })({${modules})`
    return result
}
const result = bundle(graph)
// console.log(result)


