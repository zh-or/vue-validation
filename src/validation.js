var validation = {
    groups: {},
    count: 1,
    options: {
        hintPos: 'top', /*提示显示位置 top right bottom left*/
        delayHide : 3000, /*验证提示延时消失时间, 0 为不消失*/
        checkMoment: 'blur', /*blur 失去焦点时验证, update 改变时验证*/
        defaultFunCall: {
            /*验证通过返回true, 不通过返回false*/
            min: function(val, num){
                return Number(val) >= Number(num);
            },
            max: function(val, num){
                return Number(val) <= Number(num);
            },
            minSize: function(val, size){
                return (val || '').length >= size;
            },
            maxSize: function(val, size){
                return (val || '').length <= size;
            }
        },
        rules: {
            'required': {
                regex: /\S+/,
                hint: {
                    input: '此处不可空白',
                    checkbox: '请选择',
                    radio: '请选择一个项目',
                }
            },
            'minSize': {
                regex: '',
                hint: {
                    input: '最少 [arg1] 个字符',
                }
            },
            'maxSize': {
                regex: '',
                hint: {
                    input: '最多 [arg1] 个字符',
                }
            },
            'min': {
                regex: '',
                hint: {
                    input: '最小值为 [arg1]',
                }
            },
            'max': {
                regex: '',
                hint: {
                    input: '最大值为 [arg1]',
                }
            }
        }
    },
    /**
     * 按分组验证
     * @param groupName 分组名称
     * @param opt scroll 是否滚动到第一个错误的输入框, hint 是否弹出提示
     * @returns {boolean} 返回 true 表示验证通过, false 表示验证不通过
     */
    test: function(groupName, opt){
        opt = opt || {};
        opt.scroll = opt.scroll || false;
        opt.hint   = opt.hint || false;
        var group = validation.findGroupbyName(groupName);
        var success = true;
        if(group){
            var firstErr;
            for(var i in group){
                if(!validation.validation(group[i])){
                    success = false;
                    if(opt.hint){

                    }
                    if(opt.scroll && !firstErr){
                        firstErr = group[i];
                    }
                }
            }
        }
        return success;
    },
    /*验证通过返回true, 不通过返回false*/
    validation: function(checker, showHint){
        if(showHint == undefined){
            showHint = true;
        }
        console.log('validation', checker);
        for(var i = 0; i < checker.rules.length; i++){
            var ruleName = checker.rules[i];
            var val = checker.el.value;
            if(ruleName == 'funCall') {//处理特殊的验证
                /* --- 用户自定义验证函数 ---*/
                if(!checker.funCall(checker.group, checker.el, checker.rules, val)){
                    if(showHint) validation.showHint(checker, validation.options.rules[ruleName].hint);
                    return false;
                }
                continue;
            }

            var par = /\[\S+\]/.exec(ruleName);

            if(par){
                /* --- 自带验证函数 ---*/
                var funName = ruleName.replace(/\[\S+\]/, '');
                var rules = validation.options.rules[funName];
                var parStr = (par[0] || '').replace('[', '').replace(']', '');
                var pars = parStr.split(',');
                var makeHintStr = function(pars, hint){
                    var res = {};
                    for(var i in hint){
                        for(var j = 0; j < pars.length; j ++){
                            res[i] = hint[i].replace('[arg' + (j + 1) + ']', pars[j]);
                        }
                    }
                    return res;
                }
                var defFun = validation.options.defaultFunCall[funName];
                if(defFun){
                    if(!defFun.apply(validation, [val].concat(pars))){
                        if(showHint) validation.showHint(checker, makeHintStr(pars, rules.hint));
                        return false;
                    }
                }else{
                    console.log('未知的验证方法:' + funName);
                }
            }else{
                /*--- 正则验证 ---*/
                var rules = validation.options.rules[ruleName];
                if(rules){
                    if(!rules.regex.test(val)){
                        if(showHint) validation.showHint(checker, rules.hint);
                        return false;
                    }
                }else{
                    console.log('验证方式未找到 ' + rules);
                }
            }
        }
        return true;
    },
    showHint: function(self, hint){
        console.log('showhint', self, hint);
        self.tip.el.innerText = hint.input;
        self.tip.el.style.display = 'inline-block';
        if(validation.options.delayHide > 0){
            if(self.tip.timer){
                clearTimeout(self.tip.timer);
                self.tip.timer = null;
            }
            self.tip.timer = setTimeout(function(){
                self.tip.el.style.display = 'none';
            }, validation.options.delayHide);
        }
    },
    hideHint: function(self){
        self.tip.el.style.display = 'none';
    },
    hideAll: function(){

    },
    setOptions: function(opt){
        if(opt){
            for(var i in opt){
                if(i in this.options) {
                    this.options[i] = opt[i];
                }
            }
        }
    },
    initChecker: function(el, groupName, rules, funCall){
        rules = rules || [];
        var group = validation.groups[groupName];
        if(!group){
            group = { };
            validation.groups[groupName] = group;
        }

        var tag = el.getAttribute('data-validation-tag');
        if(!tag){
            tag = el.tagName + '_' + validation.count ++;
            el.setAttribute('data-validation-tag', tag);
        }
        var checker = group[tag];

        if(checker){
            /*重新初始化*/

        }else{
            checker = {
                group: groupName,
                el: el,
                rules: rules,
                funCall: funCall,
                blurFun: function(){
                    validation.validation(checker);
                },
                tip: {
                    el: null,
                    show: false,
                    offsetParent: null,
                }
            };
            group[tag] = checker;
        }

        return checker;
    },
    getGroupName(binding){
        var keys = Object.keys(binding.modifiers);
        if(keys.length > 0){
            return keys[0];
        }
        return '';
    },
    findGroupbyName: function(groupName){
        return validation.groups[groupName];
    },
    findChecker: function(groupName, el){
        var group = validation.findGroupbyName(groupName);
        var tag = el.getAttribute('data-validation-tag');
        return group[tag];
    },
    directive: {
        bind: function (el, binding, vnode, oldVnode) {
            console.log(arguments);
            validation.initChecker(
                el,
                validation.getGroupName(binding),
                binding.value.rule,
                binding.value.funCall
            );
        },
        inserted: function (el, binding, vnode, oldVnode) {

            var checker = validation.findChecker(validation.getGroupName(binding), el);
            /*初始化提示显示*/
            var tipEl = document.createElement('div');
            tipEl.style.display = 'none';
            tipEl.style.position = 'absolute';
            tipEl.innerHTML = '&nbsp;';
            if(validation.options.hintPos == 'top'){
                tipEl.style.top = (el.offsetTop - tipEl.offsetHeight - 32) + 'px';
                tipEl.style.left = el.offsetLeft + 'px';
            }else if(validation.options.hintPos == 'right'){
                tipEl.style.top = (el.offsetTop - 4) + 'px';
                tipEl.style.left = (el.offsetLeft + el.offsetWidth + 10) + 'px';
            }
            tipEl.classList.add('validation-hint-view');
            tipEl.innerHTML = '';
            checker.tip.el = tipEl;
            checker.tip.offsetParent = el.offsetParent;
            checker.tip.offsetParent.appendChild(checker.tip.el);
            if(validation.options && validation.options.checkMoment == 'blur'){
                //el.removeEventListener('blur', checker.blurFun);
                el.addEventListener('blur', checker.blurFun );
            }

            console.log('inserted', checker)
        },
        update: function (el, binding, vnode, oldVnode) {
            /*var self = validation.getSelfGroup(el, binding, vnode, oldVnode);

            console.log('update', binding, arguments)*/
        },
        componentUpdated: function (el, binding, vnode, oldVnode) {
            var checker = validation.findChecker(validation.getGroupName(binding), el);

            if(validation.options && validation.options.checkMoment == 'update'){
                validation.validation(checker);
            }else{
                validation.hideHint(checker);
            }
            //console.log('componentUpdated', el, checker)
        },
        unbind: function (el, binding, vnode, oldVnode) {

            var keys = Object.keys(binding.modifiers);
            if(Array.isArray(keys) && keys.length > 0){

                var groupName = keys[0];
                var checker = validation.groups[groupName];
                delete validation.groups[groupName];
                checker.tip.offsetParent.removeChild(checker.tip.offsetParent);
                console.log('removed', checker);
            }
        },
    }
};


export default validation;