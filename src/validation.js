var validation = {
    groups: {},
    count: 1,
    options: {
        hintPos: 'top', /*提示显示位置 top right bottom left*/
        delayHide : 3000, /*验证提示延时消失时间, 0 为不消失*/
        checkMoment: 'blur', /*blur 失去焦点时验证, update 改变时验证*/
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
                    input: '最少[arg1]个字符',
                }
            },
            'maxSize': {
                regex: '',
                hint: {
                    input: '最多[arg1]个字符',
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
    test: function(groupName){
        var group = validation.groups[groupName];
        if(group){
            for(var i in group){
                if(!validation.validation(group[i])){
                    return false;
                }
            }
        }
        return true;
    },
    validation: function(self){
        console.log('validation', self);
        for(var i = 0; i < self.rule.length; i++){
            var r = self.rule[i];
            if(r == 'funCall') {//处理特殊的验证
                if(!self.funCall(self.group, self.el, self.rules)){
                    validation.showHint(self, v.hint);
                    return false;
                }
                continue;
            }
            var val = self.el.value;
            var par = /\[\d+\]/.exec(r);
            if(par){//有参数
                r = r.replace(/\[\d+\]/, '');
                par = par[0];
                par = par.replace('[', '');
                par = par.replace(']', '');
                par = Number(par);
                var v = validation.options.rules[r];
                var makeHintStr = function(pars, hint){
                    var res = {};
                    for(var i in hint){
                        for(var j = 0; j < pars.length; j ++){
                            res[i] = hint[i].replace('[arg' + (j + 1) + ']', pars[j]);
                        }
                    }
                    return res;
                }
                switch(r){
                    case 'min':
                        if(Number(val) < par){
                            validation.showHint(self, makeHintStr([par], v.hint));
                            return false;
                        }
                        break;
                    case 'max':
                        if(Number(val) > par){
                            validation.showHint(self, makeHintStr([par], v.hint));
                            return false;
                        }
                        break;
                    case 'maxSize':
                        if(val.length > par){
                            validation.showHint(self, makeHintStr([par], v.hint));
                            return false;
                        }
                        break;
                }
            }else{
                var v = validation.options.rules[r];
                if(v){
                    if(!v.regex.test(val)){
                        validation.showHint(self, v.hint);
                        return false;
                    }
                }else{
                    console.log('验证方式未找到 ' + r);
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
            setTimeout(function(){
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
    getSelfGroup: function(el, binding, vnode, oldVnode){

        var keys = Object.keys(binding.modifiers);
        if(keys.length > 0){
            var groupName = keys[0];
            var group = validation.groups[groupName];
            if(!group){
                group = { };
                validation.groups[groupName] = group;
            }
            var f = el.getAttribute('data-validation');
            if(!f){
                f = el.tagName + '_' + validation.count ++;
                el.setAttribute('data-validation', f);
            }
            var self = group[f];
            if(!self){
                self = {
                    group: groupName,
                    el: el,
                    rule: binding.value.rule || [],
                    funCall: binding.value.funCall,
                    tip: {
                        el: null,
                        show: false,
                        offsetParent: null,
                    }
                };
                group[f] = self;
            }
            return self;
        }
        return undefined;
    },
    directive: {
        bind: function (el, binding, vnode, oldVnode) {
            validation.getSelfGroup(el, binding, vnode, oldVnode);
        },
        inserted: function (el, binding, vnode, oldVnode) {
            var self = validation.getSelfGroup(el, binding, vnode, oldVnode);

            //self.funCall(self.group, self.el, self.rules);

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
            self.tip.el = tipEl;
            self.tip.offsetParent = el.offsetParent;
            self.tip.offsetParent.appendChild(self.tip.el);
            if(validation.options && validation.options.checkMoment == 'blur'){
                el.addEventListener('blur', function(e){
                    validation.validation(self);
                });
            }
            console.log('inserted', self)
        },
        update: function (el, binding, vnode, oldVnode) {
            /*var self = validation.getSelfGroup(el, binding, vnode, oldVnode);

            console.log('update', binding, arguments)*/
        },
        componentUpdated: function (el, binding, vnode, oldVnode) {
            var self = validation.getSelfGroup(el, binding, vnode, oldVnode);

            if(validation.options && validation.options.checkMoment == 'update'){
                validation.validation(self);
            }else{
                validation.hideHint(self);
            }
            //console.log('componentUpdated', self)
        },
        unbind: function (el, binding, vnode, oldVnode) {

            var keys = Object.keys(binding.modifiers);
            if(Array.isArray(keys) && keys.length > 0){

                var groupName = keys[0];
                var self = validation.groups[groupName];
                delete validation.groups[groupName];
                self.tip.offsetParent.removeChild(self.tip.offsetParent);
                console.log('removed', self);
            }
        },
    }
};


export default validation;