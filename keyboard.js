/**
 * Created by chenkuan on 2017/5/22.
 */
(function () {
    var inputs = document.querySelectorAll("*[data-kb-input]");
    var theme = {
        sleep:{
            color:'#ccc'
        },
        active:{
            color:''
        },
        background:"#fff",
        fontFamily:'-apple-system, BlinkMacSystemFont, "PingFang SC","Helvetica Neue",STHeiti,"Microsoft Yahei",Tahoma,Simsun,sans-serif'
    };
    Array.prototype.some.call(inputs,function (it) {
        initKeyBoard(it);
    });

    function initKeyBoard(input) {
        input.style.color = theme.sleep.color;
        input.innerText = input.getAttribute('data-kb-placeholder')||'';
        input.setAttribute("data-kb-value",'');

        input.addEventListener("touchend",function (e) {
            e.stopPropagation();
            Keyboard.focus(input);
        });
    }


    var Keyboard={
        _dynamicValue:'',
        bindInput:null,
        timer:null,
        // 聚焦编辑框
        focus:function (input) {
            // 前一个失焦
            this.blur();

            // 所有源生元素失焦
            Array.prototype.some.call(document.querySelectorAll("input,textarea"),function (it) {
                it.blur()
            })

            // 设定新一个
            this.bindInput = input;

            // 1 取新输入框的值
            var inputValue = input.getAttribute('data-kb-value');

            // 2 定义键盘值与输入框属性的关联
            Object.defineProperty(Keyboard,'dynamicValue',{
                configurable: true,
                set:function (newval) {
                    // 更新input表面与属性
                    input.innerText = newval;
                    input.setAttribute('data-kb-value',newval);
                    // 恢复主题色
                    input.style.color = theme.active.color;

                    // 设置新值
                    this._dynamicValue = newval;
                },
                get:function () {
                    return this._dynamicValue;
                }
            });

            // 3 设置默认值为属性中的值
            Keyboard.dynamicValue = inputValue;

            this.fadeIn();
        },

        // 失焦点编辑框
        blur:function () {
            var input = this.bindInput;if(!input)return;
            // 先恢复原input的值
            if(input.getAttribute('data-kb-value')){
                input.innerText = input.getAttribute('data-kb-value')
                input.style.color = theme.active.color;
            }else{
                input.innerText =  input.getAttribute('data-kb-placeholder')||'';
                input.style.color = theme.sleep.color;
            };

            // 然后解除绑定
            if(Keyboard._dynamicValue){
                delete Keyboard._dynamicValue;
                delete Keyboard.dynamicValue;
            }

            this.fadeOut();
        },
        sendKey:function (key) {
            if(this.bindInput){
                // 不能重复输入 '.'
                if(key=='.' && this.dynamicValue.indexOf('.')>0)return ;

                // 长度限制
                if(this.bindInput.getAttribute('data-kb-input-limit') && this.dynamicValue.length>=this.bindInput.getAttribute('data-kb-input-limit'))return;

                var value = this.bindInput.getAttribute('data-kb-value');
                this.dynamicValue = value + key;
            }
        },
        backspace:function () {
            if(this.bindInput){
                var value = this.bindInput.getAttribute('data-kb-value');
                this.dynamicValue = value.substr(0,value.length-1);
            }
        },
        fadeOut:function () {
            this.stopAnimate();
            this.clearStuff();
            var starttime = Date.now();
            var duration = 300;
            var self = this;
            this.timer = setInterval(function () {
                var per = (Date.now() - starttime ) / duration;
                per = Math.min(per,1);
                var trans = 40 * per;
                kb.style.transform = 'translateY('+trans+'vh)';
                if(per==1){
                    clearInterval(self.timer);
                    kb.style.display='none';
                }
            },13);

        },
        fadeIn:function () {
            this.stopAnimate();
            this.scrollToThere();
            kb.style.display="flex";
            var starttime = Date.now();
            var duration = 300;
            var self = this;
            this.timer = setInterval(function () {
                var per = (Date.now() - starttime ) / duration;
                per = Math.min(per,1);
                var trans = 40 - 40 * per;
                kb.style.transform = 'translateY('+trans+'vh)';
                if(per==1){
                    clearInterval(self.timer);
                }
            },13);
        },
        stopAnimate:function () {
            clearInterval(this.timer);
        },
        clearStuff:function () {
            paddinBlock.style.display = 'none';
        },
        scrollToThere:function () {
            paddinBlock.style.display = 'block';
            var eleHeight = this.bindInput.offsetTop;
            var viewportHeight = document.defaultView.innerHeight;
            document.body.scrollTop = eleHeight - viewportHeight*.4 + this.bindInput.offsetHeight
        }
    };


    /**
     * 构建键盘
     * @type {Element}
     */
    var kb = document.createElement("div");
    for(var i=0;i<4;i++){
        var line = document.createElement("div");
        line.style.display = "flex";
        line.style.flexDirection = "row";
        line.style.height = "10vh";
        line.style.justifyContent = "space-between";
        for(var j=0;j<3;j++){
            var cell = document.createElement("span");

            if(i<3){
                cell.innerText = (j+1) + i*3
                cell.setAttribute('data-kb-type',"char")
            }else{
                if(j==0){
                    cell.setAttribute('data-kb-type',"char");
                    cell.innerText = "."
                }
                if(j==1){
                    cell.setAttribute('data-kb-type',"char");
                    cell.innerText = "0"
                }
                if(j==2){
                    cell.setAttribute('data-kb-type',"delete");
                    cell.innerText = "删除"
                    cell.style.fontSize = '2.5vh';
                }
            }

            cell.style.flexGrow = 1;
            cell.classList.add("button");
            cell.style.flexBasis = '33%';
            cell.style.textAlign ="center";
            cell.style.margin = "0 0 -1px -1px";
            cell.style.border = "1px solid #eee";
            cell.style.color = "#666";
            cell.style.display = 'flex';
            cell.style.flexDirection = 'column';
            cell.style.justifyContent = 'center';
            cell.userSelect = 'none';
            line.appendChild(cell)
        }
        kb.appendChild(line)
    }
    kb.style.width='100%';
    kb.style.height = '40vh';
    kb.style.fontSize = '4vh';
    kb.style.flexDirection = 'column';
    kb.style.position = 'fixed';
    kb.style.left = 0;
    kb.style.bottom = 0;
    kb.style.display = 'none';
    kb.style.transition = "translateY(40vh)";
    kb.style.background = theme.background;
    kb.style.zIndex = '999999';
    kb.style.fontFamily = theme.fontFamily;

    kb.addEventListener("touchstart",kbTouch);
    kb.addEventListener("longtouch",kbTouch);

    // 点击颜色改变
    kb.addEventListener("touchstart",function (e) {e.target.style.backgroundColor='#eee'});
    kb.addEventListener("touchend",function (e) {e.target.style.backgroundColor=''});

    function kbTouch(e) {
        e.stopPropagation();
        e.preventDefault()
        var btn = e.target;
        if(btn.getAttribute('data-kb-type')=="char")
            Keyboard.sendKey(e.target.innerText);
        if(btn.getAttribute('data-kb-type')=="delete")
            Keyboard.backspace()
    }



    // 键盘隐藏事件
    document.addEventListener("touchstart",function () {
        Keyboard.blur()
    });

    document.body.appendChild(kb);


    // 构建长按事件
    var timer_justify,timer_key;
    kb.addEventListener('touchstart',function (e) {
        timer_justify = setTimeout(function () {
            timer_key = setInterval(function(){
                var longtouchEvt = new Event('longtouch',{"bubbles":true, "cancelable":true});
                e.target.dispatchEvent(longtouchEvt)
            },200);
        },800)
    });

    kb.addEventListener('touchend',function (e) {
        clearTimeout(timer_justify);
        clearInterval(timer_key);
    });


    /**
     * 底部填充块
     * @type {Element}
     */
    var paddinBlock = document.createElement('div');
    paddinBlock.style.height = '40vh';
    paddinBlock.style.width = '100vw';
    paddinBlock.style.opacity = 0;
    paddinBlock.style.display = 'none';
    document.body.appendChild(paddinBlock);
})();
