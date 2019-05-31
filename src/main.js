import Vue from 'vue'
import App from './App.vue'
import Validation from './validation'

Vue.config.productionTip = false;

Validation.setOptions({
    delayHide: 0,
    hintPos: 'right',
});

Vue.directive('validation', Validation.directive);
Vue.prototype.$validation = Validation;

new Vue({
  render: h => h(App),
}).$mount('#app')
