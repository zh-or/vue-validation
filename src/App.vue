<template>
    <div id="app">
        <textarea  v-model="data.val0" v-validation.test="{'rule': ['min[0]', 'max[100]', 'required']}"></textarea>
        <input type="text" v-validation.test="{'rule': ['required', 'minSize[1]', 'maxSize[3]'], 'funCall': test}" v-model="data.val1"/>
        <div>
            <label>test1 <input type="radio" name="test" v-model="data.val2" value="test1" v-validation.test.radio></label> &nbsp;&nbsp;
            <label>test2 <input type="radio" name="test" v-model="data.val2" value="test2" v-validation.test.radio="{rule: ['required']}"></label>
        </div>
        <div>
            <select v-validation.test="{'rule': ['required']}" v-model="data.select">
                <option value="1">测试1</option>
                <option value="2">测试2</option>
            </select>
        </div>
        <div>
            <label><input type="checkbox" name="test1" v-model="data.val3" value="a" v-validation.test.cbox>a</label>
            <label><input type="checkbox" name="test1" v-model="data.val4" value="b" v-validation.test.cbox>b</label>
            <label><input type="checkbox" name="test1" v-model="data.val5" value="c" v-validation.test.cbox>c</label>
            <label><input type="checkbox" name="test1" v-model="data.val6" value="d" v-validation.test.cbox="{rule: ['required', 'minSize[2]', 'maxSize[3]']}">d</label>
        </div>
        <div>
            <button @click="check">validation</button>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'app',
        components: {},
        data: function(){
            return{
                data: {
                    select: '',
                    val0: '',
                    val1: '',
                    val2: '',
                    val3: '',
                    val4: '',
                    val5: '',
                    val6: '',
                }
            }
        },
        methods: {
            test: function(groupName, el, rules){
                console.log('自定义验证函数', this, arguments);
            },
            check: function(){
                var res = this.$validation.test('test', {scroll: false, hint: true});
                console.log('分组验证:' + res);
            }
        }
    }
</script>

<style>
    #app {
        width: 200px;
        margin: 20px auto 0;
    }

    #app > *{
        display: block;
        margin-top: 20px;
        width: 150px;
    }

    .validation-hint-view{
        background-color: #ffa825;
        color: #fff;
        padding: 5px 10px;
        font-size: 12px;
        border-radius: 3px;
    }

    .validation-hint-view:after{
        content: " ";
        width:0;
        height:0;
        border-width:6px 6px 6px 0;
        border-style:solid;
        border-color:transparent #ffa825 transparent transparent;/*透明 灰 透明 透明 */
        margin:40px auto;
    }

</style>
