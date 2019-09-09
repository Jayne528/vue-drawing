$(function(){
    var vm = new Vue({
        el: "#app",
        data: {
            graphModes:[],  // 儲存所有影格
            settings: {     //預設寬高
                width: 15,
                height: 15
            },
            mirrorModeX: true,  // 是否為鏡像模式
            mirrorModeY: false,
            currentModeId: 0,  //目前在第幾個影格
            editing: false,  //是否在編輯模式
            lightBox: "0",
            lightBoxMode:false,
        },
        created() {
            this.init()
            
            window.addEventListener("keydown",(evt)=> {
                console.log(evt.key)
                if(parseInt(evt.key)<=this.graphModes.length) {
                    this.currentModeId = parseInt(evt.key)-1
                }
            })
            this.load("15,15:|||410|220|7f0|dd8|1ffc|17f4|410|360||||#|||410|1224|17f4|1ddc|ff8|410|808|||||")
        },
        methods: {
            init() {
                this.currentModeId=0
                this.graphModes=[],
                this.lightBox= "0",
                this.lightBoxMode=false,
                this.addMode()
            },
            load(data) {
                var allText = data.split(':')[1] //畫板資料
                var settings = data.split(":")[0].split(",")  //分解寬高
                this.settings.width = parseInt(settings[0])
                this.settings.height = parseInt(settings[1])
                this.init() 
                // 先把所有影格拆開，在分行，再把16進位轉成2進位
                this.graphModes = allText.split("#").map(mode=> {
                    return mode.split("|").map(line=> this.convertBinary(line)).join("")
                }).map(mode=>mode.split("").map(t=> {
                    return {value: t}
                }))
            },
            convertBinary(text) {
                if(!text) {
                    text="0"
                }
                var result = parseInt(text,16).toString(2)
                //因為有把0去掉，所以要把0墊回來、墊回寬度的長度
                result = result.padStart(this.settings.width,0)
                result= result.replace(/0/g,'-').replace(/1/g,'+')
                return result
            },
            addMode() {
                //建立新的影格，設定graphModes 陣列長度，推入value＝“-”(表示未填色) 進去  (d,i)資料跟第幾個, 回傳一個物件
                this.graphModes.push(
                    Array.from({length: this.settings.width * this.settings.height},(d,i)=>{
                        return  {value: "-"}
                    })
                )
                //新增會跳到最新影格
                this.currentModeId = this.graphModes.length-1
            },
            //取得影格在陣列中的位置
            getArrayId(o,i) {
                return (o-1)*this.settings.width + (i-1)
            },
            toggleBlock(o,i, black) {
                var obj = this.graphDate[this.getArrayId(o,i)]
                obj.value = obj.value=="+"?"-":"+"
                if(black) {
                    obj.value="+"
                }
                if(this.mirrorModeX) {
                    var mid = (this.settings.width+1)/2
                    var nx = mid- (i-mid)
                    //如果鏡射不是自己本身在執行
                    if(i !=nx) {
                        var obj = this.graphDate[this.getArrayId(o,nx)]
                        obj.value = obj.value=="+"?"-":"+"
                        if(black) {
                            obj.value="+"
                        }
                    }
                }
                if(this.mirrorModeY) {
                    var midy = (this.settings.height+1)/2
                    var my = midy- (o-midy)
                    //如果鏡射不是自己本身在執行
                    if(o !=my) {
                        var obj = this.graphDate[this.getArrayId(my,i)]
                        obj.value = obj.value=="+"?"-":"+"
                        if(black) {
                            obj.value="+"
                        }
                    }
                }
                if(this.mirrorModeY && this.mirrorModeX) {
                    if(o !=my && i !=nx) {
                        var obj = this.graphDate[this.getArrayId(my,nx)]
                        obj.value = obj.value=="+"?"-":"+"
                        if(black) {
                            obj.value="+"
                        }
                    }
                }
            },
            removeMode(id){
                if (this.currentModeId>=id){
                    if(this.currentModeId!=0) {
                        this.currentModeId-=1
                    }
                }
                this.graphModes.splice(id,1)
            },
            //把＋換成1，- 換成0 ，反斜線 "/" 搜尋特殊字元，g 代表搜尋全部
            convertHex(text) {
                var result = text.replace(/\-/g,"0").replace(/\+/g,"1")
                //先把2進位轉成10進位再轉成16進位
                return result = parseInt(result,2).toString(16)
            },
            loadCode() {
                this.load(prompt("Please enter Code"))
            },
        },
        computed: {
            //從所有影格中，找出目前的影格資料
            graphDate() {
                return this.graphModes[this.currentModeId]
            },
             //從所有影格中，找出燈箱影格資料
            graphLightDate() {
                return this.graphModes[this.lightBox]
            },
            // 轉換code
            code() {
                var result = `${this.settings.width},${this.settings.height}:`
                result += this.graphModes.map(mode=> {
                    var modeText = mode.map(block=> block.value) //把每個block的值取出。會變成-,+,-的陣列符號表示

                    //依照行的寬度來幫值分群，再來組合去掉"，"
                    //_.chunk([1,2,3,4,5,6,7,8],3) => [1,2,3],[4,5,6],[7,8]
                    // return _.chunk(modeText,this.settings.width).map(line=>line.join("")).join("|\n")
                    return _.chunk(modeText,this.settings.width)
                    .map(line=>line.join(""))  //去掉”，“
                    .map(line=>this.convertHex(line))  //2進位轉換成16進位
                    .map(line=>line!=0?line:"")  //從line 抓出每個line 如果值不等於0就顯示，不然就顯示空字串
                    .join("|")
                }).join("#")  //每個影格分隔 ＃
                return result
            }
        },
    })
    
})
