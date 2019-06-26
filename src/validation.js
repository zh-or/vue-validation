//克隆对象属性
function cloneObj(dest, src, lvl){
    if(src && lvl && lvl <= 0) return false;
    for(var f in dest){
        if(f in src){
            var type = (typeof dest[f]).toLocaleLowerCase();
            if(type == 'object'){//array = object
                if(Array.isArray(dest[f])){
                    dest[f] = src[f];
                }else if(!cloneObj(dest[f], src[f], lvl ? lvl - 1 : undefined)){
                    dest[f] = src[f];
                }
            }else{
                switch(type){
                    case 'string':
                    case 'number':
                    case 'boolean':
                    {
                        try{
                            dest[f] = src[f];
                        }catch(e){
                            if(validation.debug){
                                console.log('clone error:', e);
                            }
                        }
                    }
                }
            }
        }

    }
    return true;
}


var validation = {
    debug: true,
    groups: {},
    count: 1,
    options: {
        tipsPos: 'top',    /*提示显示位置 top right bottom left*/
        delayHide : 3000,  /*验证提示延时消失时间, 0 为不消失*/
        checkMoment: 'blur', /*blur 失去焦点时验证, update 改变时验证*/
        errorFunction: function(){ },
        hideTipsFunction: function(){ },
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
                tips: {
                    input: '此处不可空白',
                    checkbox: '请选择',
                    radio: '请选择一个项目',
                }
            },
            'minSize': {
                regex: '',
                tips: {
                    input: '最少 [arg1] 个字符',
                    checkbox: '最少选择 [arg1] 个项目',
                }
            },
            'maxSize': {
                regex: '',
                tips: {
                    input: '最多 [arg1] 个字符',
                    checkbox: '最多选择 [arg1] 个项目',
                }
            },
            'min': {
                regex: '',
                tips: {
                    input: '最小值为 [arg1]',
                }
            },
            'max': {
                regex: '',
                tips: {
                    input: '最大值为 [arg1]',
                }
            }
        }
    },
    /**
     * 按分组验证
     * @param groupName 分组名称
     * @param opt scroll 是否滚动到第一个错误的输入框, tips 是否弹出提示
     * @returns {boolean} 返回 true 表示验证通过, false 表示验证不通过
     */
    test: function(groupName, opt){
        opt = opt || {};
        opt.scroll = opt.scroll || false;
        opt.showTips   = opt.showTips == undefined ? true : opt.showTips;
        var group = validation.groups[groupName];
        var success = true;
        if(group){
            var firstErr;
            for(var i in group){

                if(!validation.validation(group[i])){
                    validation.options.errorFunction(group[i])
                    success = false;
                    if(opt.tips){

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
    validation: function(checker, showTips){
        if(showTips == undefined){
            showTips = true;
        }
        console.log('validation', checker);
        for(var i = 0; i < checker.rules.length; i++){
            var ruleName = checker.rules[i];
            var val = checker.el.value;
            if(ruleName == 'funCall') {//处理特殊的验证
                /* --- 用户自定义验证函数 ---*/
                if(!checker.funCall(checker.group, checker.el, checker.rules, val)){
                    if(showTips) validation.showTips(checker, validation.options.rules[ruleName].tips);
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
                var makeHintStr = function(pars, tips){
                    var res = {};
                    for(var i in tips){
                        for(var j = 0; j < pars.length; j ++){
                            res[i] = tips[i].replace('[arg' + (j + 1) + ']', pars[j]);
                        }
                    }
                    return res;
                }
                var defFun = validation.options.defaultFunCall[funName];
                if(defFun){
                    if(!defFun.apply(validation, [val].concat(pars))){
                        if(showTips) validation.showTips(checker, makeHintStr(pars, rules.tips));
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
                        if(showTips) validation.showTips(checker, rules.tips);
                        return false;
                    }
                }else{
                    console.log('验证方式未找到 ' + rules);
                }
            }
        }
        return true;
    },
    showTips : function(self, tips){
        console.log('showTips', self, tips);
        self.tip.el.innerText = tips.input;
        self.tip.el.style.display = 'inline-block';
        if(validation.options.delayHide > 0){
            if(self.tip.timer){
                clearTimeout(self.tip.timer);
                self.tip.timer = null;
            }
            self.tip.timer = setTimeout(function(){
                self.tip.el.style.display = 'none';
                validation.options.hideTipsFunction(self);
            }, validation.options.delayHide);
        }
    },
    hideTips: function(self){
        if(self){
            self.tip.el.style.display = 'none';
        }
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
    initChecker: function(el, groups, rules, funCall){
        /*group 支持两级*/
        rules = rules || [];
        var group, groupName,
            isExtend = groups.length >= 2;
        if(groups.length > 0){
            groupName = groups[0];
            group = validation.groups[groupName];
            if(!group){
                group = { };
                validation.groups[groupName] = group;
            }
        }else{
            console.error('请填写分组信息(v-validation.xxx):', el);
            return;
        }
        var tag;
        if(isExtend){
            tag = groups[1];
            el.setAttribute('data-validation-tag', tag);
        }else{
            tag = el.getAttribute('data-validation-tag');
            if(!tag){
                tag = el.tagName + '_' + validation.count ++;
                el.setAttribute('data-validation-tag', tag);
            }
        }

        var checker = group[tag];

        if(checker){
            /*重新初始化*/
            if(checker.isExtend){
                checker.el.push(el);
                checker.rules = rules;/*以最后一个规则为准*/
            }
        }else{
            checker = {
                group: groupName,
                el: isExtend ? [el] : el,
                isExtend: isExtend,
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
    findChecker: function(groups, el){
        var group = validation.groups[groups[0]];
        var tag = el.getAttribute('data-validation-tag');
        return group[tag];
    },
    directive: {
        bind: function (el, binding, vnode, oldVnode) {
            validation.initChecker(
                el,
                Object.keys(binding.modifiers),
                binding.value ? binding.value.rule: [],
                binding.value ? binding.value.funCall: null,
            );
        },
        inserted: function (el, binding, vnode, oldVnode) {

            var checker = validation.findChecker(Object.keys(binding.modifiers), el);
            function resetPosition(){
                if(validation.options.tipsPos == 'top'){
                    checker.tip.el.style.top = (el.offsetTop - checker.tip.el.offsetHeight - 32) + 'px';
                    checker.tip.el.style.left = el.offsetLeft + 'px';
                }else if(validation.options.tipsPos == 'right'){
                    checker.tip.el.style.top = (el.offsetTop - 4) + 'px';
                    checker.tip.el.style.left = (el.offsetLeft + el.offsetWidth + 10) + 'px';
                }
            }
            if(checker.isExtend && checker.tip.el){
                resetPosition();
            }else{
                /*初始化提示显示*/
                var tipEl = document.createElement('div');
                tipEl.style.display = 'none';
                tipEl.style.position = 'absolute';
                tipEl.innerHTML = '&nbsp;';

                tipEl.classList.add('validation-hint-view');
                tipEl.innerHTML = '';
                checker.tip.el = tipEl;

                resetPosition();

                checker.tip.offsetParent = el.offsetParent;
                checker.tip.offsetParent.appendChild(checker.tip.el);
                if(validation.options && validation.options.checkMoment == 'blur'){
                    //el.removeEventListener('blur', checker.blurFun);
                    el.addEventListener('blur', checker.blurFun );
                }
            }
        },
        update: function (el, binding, vnode, oldVnode) {
            /*var self = validation.getSelfGroup(el, binding, vnode, oldVnode);

            console.log('update', binding, arguments)*/
        },
        componentUpdated: function (el, binding, vnode, oldVnode) {
            var checker = validation.findChecker(Object.keys(binding.modifiers), el);

            if(validation.options && validation.options.checkMoment == 'update'){
                validation.validation(checker);
            }else{
                validation.hideTips(checker);
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