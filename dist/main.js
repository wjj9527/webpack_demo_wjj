
        (()=>{
    const pathReference = {"./info.js":"src/info.js","./name.js":"src/name.js"}
    const modules = {"src/name.js":(module, exports, require)=>{
            "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = '龙骑士尹道长';
exports["default"] = _default;
        },"src/info.js":(module, exports, require)=>{
            "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _name = _interopRequireDefault(require("./name.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var _default = "".concat(_name["default"], " 666");
exports["default"] = _default;
        },"./src/index.js":(module, exports, require)=>{
            "use strict";

var _info = _interopRequireDefault(require("./info.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
console.log(_info["default"]);
        },}
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
    require('./src/index.js')
})();
    