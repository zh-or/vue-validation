import Vue from 'vue'
import App from './App.vue'
import Validation from './validation'

Vue.config.productionTip = false;

Validation.setOptions({
    delayHide: 3000,
    tipsPos: 'right',
    errorFunction: function(checker){
        if(checker.isExtend){
            checker.el.forEach(function(el){
                el.style.border = '1px solid #f00';
            })
        }else{
            checker.el.style.border = '1px solid #f00';
        }
    },
    hideTipsFunction: function(checker){

        if(checker.isExtend){
            checker.el.forEach(function(el){
                el.style.border = '';
            });
        }else{
            checker.el.style.border = '';
        }
    }
});

Vue.directive('validation', Validation.directive);
Vue.prototype.$validation = Validation;

new Vue({
  render: h => h(App),
}).$mount('#app')
