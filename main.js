var myChart = echarts.init(document.getElementById("main"));

var highLight = ""; // 用于将匹配文本高亮显示的全局变量

var chartBackgroundColor = "white"; // 图表背景色

var chartTextColor = "black"; // 图表中的文字颜色

jsonData = {"name":"Begin","children":[]};

var winWidth;
var winHeight;
// 获取窗口宽度
if (window.innerWidth){
    winWidth = window.innerWidth;
}else if ((document.body) && (document.body.clientWidth)){
    winWidth = document.body.clientWidth;
}
// 获取窗口高度
if (window.innerHeight){
    winHeight = window.innerHeight;
}else if((document.body) && (document.body.clientHeight)){
    winHeight = document.body.clientHeight;
}
// 将fullHide铺满屏幕
$(".fullHide").css("height", winHeight);
$(".fullHide").css("width", winWidth);

function showChart(data) {
    myChart.setOption(option = {
        backgroundColor: chartBackgroundColor,
        tooltip: {
            trigger: 'item',  //触发类型，默认：item（数据项图形触发，主要在散点图，饼图等无类目轴的图表中使用）。可选：'axis'：坐标轴触发，主要在柱状图，折线图等会使用类目轴的图表中使用。'none':什么都不触发。
            triggerOn: 'mousemove' //提示框触发的条件，默认mousemove|click（鼠标点击和移动时触发）。可选mousemove：鼠标移动时，click：鼠标点击时，none：无
        },
        title : {
            triggerEvent: true
        },
        // 工具箱
        toolbox:{
            show:true,
            top: "3%",
            feature:{
                // 数据视图
                dataView:{
                    show:true
                },
                // 刷新
                restore:{
                    show:true,
                    title:"刷新",
                },
                // 保存图片
                saveAsImage:{
                    show: true,                // 是否显示该工具。
                    type:"png",                // 保存的图片格式。支持 'png' 和 'jpeg'。
                    name:"arkmind-picture",               // 保存的文件名称，默认使用 title.text 作为名称
                    backgroundColor:"#ffffff", // 保存的图片背景色，默认使用 backgroundColor，如果backgroundColor不存在的话会取白色
                    title:"保存为图片",
                    pixelRatio:1
                }
            }
        },
        series: [ //系列列表
            {
                type: 'tree',        //图表种类为树图
                data: [data],        //数据数组
                top: '1%',           //与顶部的距离
                left: '7%',          //与左边的距离
                bottom: '1%',        //与底部的距离
                right: '20%',        //与右边的距离
                roam: true,          //允许缩放和平移
                symbol: 'emptyCircle', //标记的样式
                itemStyle: {         //标记的颜色设置
                    color: '#d63031',
                    borderColor: '#e17055'
                },
                symbolSize: 10,      //标记（小圆圈）的大小，默认是7
                initialTreeDepth: 1, //默认：2，树图初始展开的层级（深度）。根节点是第 0 层，然后是第 1 层、第 2 层，... ，直到叶子节点
                label: {             //每个节点对应的标签的样式
                    triggerEvent: true,
                    normal: {
                        position: 'left',           //标签的位置
                        verticalAlign: 'middle',    //文字垂直对齐方式，默认自动。可选：top，middle，bottom
                        align: 'right',             //文字水平对齐方式，默认自动。可选：top，center，bottom
                        fontSize: 18,               //标签文字大小
                        color: chartTextColor,
                        formatter: function (param) { //formatter通过设置为函数，对name进行判断，看是否有匹配的关键字，如果匹配上了，就返回一个匹配富文本的格式；下边的rich就是富文本样式设置。
                            if ("" !== highLight && param.name.match(highLight)) {
                                return '{a|' + param.name + '}'
                            } else {
                                return param.name;
                            }
                        },
                        rich: {
                            a: {
                                color: 'red',
                                lineHeight: 10,
                                fontSize: 24
                            }
                        }
                    }
                },
                leaves: {   //叶子节点的特殊配置
                    label: {
                        normal: {
                            position: 'right',
                            verticalAlign: 'middle',
                            align: 'left'
                        }
                    }
                },
                expandAndCollapse: true,     //子树折叠和展开的交互，默认打开
                animationDuration: 1000,      //初始动画的时长，支持回调函数,默认1000
                animationDurationUpdate: 750 //数据更新动画的时长，默认300
            }
        ]
    });
}

//遍历json数据为每个json节点添加pid属性唯一标识,同时为每个echarts节点添加value属性，使每个节点的pid==value
function setPid(node, pid) {
    if(undefined === node.name || null == node.name){
        return;
    }
    node.pid = pid + "";
    node.value = pid + "";
    for(var sub in node.children){
        setPid(node.children[sub], pid+"."+sub);
    }
}

setPid(jsonData, 0);
showChart(jsonData);

function reshowChart(){ //将图表还原
    closeNodes(jsonData);
    highLight = "";
    showChart(jsonData);
}

function changeChartColor() { //更换界面颜色
    if(chartBackgroundColor == "white"){
        chartBackgroundColor = '#2d3436';
        chartTextColor = 'white';
    }else{
        chartBackgroundColor = 'white';
        chartTextColor = 'black';
    }
    showChart(jsonData);
}


//json数据中的collapsed:false表示该节点默认展开，为true时折叠
//检索搜索框中的文本，展开搜索的数据节点

var isFound = false; //用于判断是否匹配到了文本的全局变量

// 搜索内容
function searchData() {
    var text = $("#searchInput").val();
    if(text === "" || text == null){
        alert("请输入需要匹配的文字！");
        return;
    }
    var expression = /^\s+?/;
    if(text.match(expression)){ //不匹配空白字符
        return;
    }
    closeNodes(jsonData);
    findNodesAndMatchText(text, jsonData, 0);
    highLight = text;
    showChart(jsonData);
}

// 遍历json数据匹配搜索的文本
function findNodesAndMatchText(text, node) {
    if(node.name === undefined || node.name == null){
        return;
    }
    var name = node.name;
    if(name.indexOf(text) >= 0){
        if(isFound === false){
            isFound = true;
        }
        if(isFound === true){
            findParents(jsonData, node);
            isFound = false;
        }
    }
    for(var sub in node.children){
        findNodesAndMatchText(text, node.children[sub]);
    }
}

// 根据节点的pid寻找其所有的父节点
function findParents(jsonData, node) {
    var temp = node.pid.split("\.");
    var pids = [];
    var str = "";
    for(var i=0; i<temp.length-1; i++){
        str += temp[i];
        pids[i] = str;
        str += ".";
    }
    setParentsOpen(pids, 0, jsonData);
}

// 递归寻找父节点，并将符合要求的父节点设置为展开状态
function setParentsOpen(pids, index, node) {
    if(index >= pids.length){
        return;
    }
    if(node.pid == pids[index]){
        node.collapsed = false;
    }
    for(i in node.children){
        setParentsOpen(pids, index+1, node.children[i]);
    }
}

// 将所有的节点的collapsed状态还原（闭合）
function closeNodes(node) {
    if(node.name === undefined || node.name == null){
        return;
    }
    if(node.pid !== 0){ //根节点不收缩
        node.collapsed = true;
    }
    for(var sub in node.children){
        closeNodes(node.children[sub]);
    }
}

// 防止默认菜单弹出
$('#main').bind("contextmenu", function () { return false; });

var nodeParams = null; //用于保存被右击的节点的全局变量

myChart.on('contextmenu', function (params) {
    $('#right-click-menu').css({ //右击节点弹出选项框
        'display': 'block',
        'left': params.event.offsetX + 15,
        'top' : params.event.offsetY + 70
    });
    nodeParams = params;
});

$('#main').click(function () { //点击任意处关闭弹框
    $('.click-menu').css({
        'display': 'none',
        'left': '-9999px',
        'top' : '-9999px'
    });
    if("" !== highLight){ //如果有高亮显示的节点则点击任意处消除
        highLight = "";
        showChart(jsonData);
    }
    nodeParams = null;
});

// 新增子节点
function addNode() {
    $('.click-menu').hide();
    $('#input-menu').css({ // 右击节点弹出选项框
        'left': nodeParams.event.offsetX + 10,
        'top' : nodeParams.event.offsetY + 70,
        "visibility": "visible",
    });

    $('#input-menu').show();
    // 使其自动获得焦点
    setTimeout(function(){
        $('#input-menu').find("input").focus();
    },50);
}

// 确认新增
function addNodeConfirm(yn) {
    var expression = /^\s+?/; // 不匹配空白字符
    var text = $("#newNodeName").val();
    if(yn === true){
        if(text === "" || text.match(expression)){
            alert("名称不能是空白字符");
            return;
        }
        findNodesAndDoAction(nodeParams.value, jsonData, "add", text);
    }
    nodeParams = null;
    shutDownMenu("input-menu");
}

// 删除节点
function deleteNode() {
    $('.click-menu').hide();
    $('#delete-menu').css({ // 右击节点弹出选项框
        'left': nodeParams.event.offsetX + 10,
        'top' : nodeParams.event.offsetY + 70,
        "visibility": "visible",
    });
    $('#delete-menu').show();
}

// 确认删除
function deleteNodeConfirm(yon) {
    if(yon === false) {
        shutDownMenu("delete-menu");
        return;
    }
    findNodesAndDoAction(nodeParams.value, jsonData, "delete", "");
    shutDownMenu("delete-menu");
    nodeParams = null;
}

// 编辑节点的名称
function updateNode() {
    $('.click-menu').hide();
    $('#update-menu').css({ //右击节点弹出选项框
        'left': nodeParams.event.offsetX + 10,
        'top' : nodeParams.event.offsetY + 70,
        "visibility": "visible",
    });
    //使其自动获得焦点
    setTimeout(function(){
        $('#update-menu').find("input").focus();
    },50);
    $('#update-menu').show();
}

// 确认编辑
function updateNodeConfirm(yn) {
    var expression = /^\s+?/; // 不匹配空白字符
    var newName = $("#newNodeName2").val();
    if(yn === true){
        if(newName === "" || newName.match(expression)){
            alert("名称不能是空白字符");
            return;
        }
        findNodesAndDoAction(nodeParams.value, jsonData, "update", newName);
    }
    shutDownMenu("update-menu");
    nodeParams = null;
}

// 关闭信息框
function shutDownMenu(menuId) {
    $("#"+menuId).find('input').val("");
    $("#"+menuId).hide();
}

function findNodesAndDoAction(value, node, action, text) { // 遍历json数据寻找指定节点
    if(node.name === undefined || node.name == null){
        return;
    }
    if(node.pid === value){
        if(action === "add"){ // 添加一个子节点
            var newNodePid;
            if(node.children != null){
                newNodePid = node.pid + "." + node.children.length;
            }else{
                node.children=[];
                newNodePid = node.pid + "." + "0";
            }
            var newNode = {"name":text,"children":[],"pid":newNodePid,"value":newNodePid,"collapsed":true};
            node.children.push(newNode);
            node.collapsed = false;
            findParents(jsonData, node); // 添加一个节点后，新节点到根节点的路径上的所有父节点都要展开
        }else if(action === "delete"){ // 删除一个节点
            if(node.pid === "0"){ // 不能删除根节点
                return;
            }
            var nodePidStr = node.pid + "";
            var parentPid = nodePidStr.substring(0, nodePidStr.lastIndexOf("\."));
            findParents(jsonData, node); // 删除节点前先将其父路径节点展开
            findParentAndDeleteSomeNode(jsonData, parentPid, nodePidStr.substring(nodePidStr.lastIndexOf("\.")+1, node.pid.length));
        }else if(action === "update"){ // 修改一个节点的名称
            node.name = text;
        }else if(action === "isLeaveNode"){ // 判断该节点是否是叶子节点
            if(node.children === undefined || node.children.length === 0){
                isLeaveNode = true;
            }else{
                isLeaveNode = false;
            }
            return;
        }
        showChart(jsonData, node);
        return;
    }
    for(var sub in node.children){
        findNodesAndDoAction(value, node.children[sub], action, text);
    }
}

// 通过寻找父节点来删除子节点，但是还需要将父节点的children中的node的pid和value属性做相应的更改
function findParentAndDeleteSomeNode(node, parentPid, childIndex) {
    if(node.name === undefined || node.name == null){
        return;
    }
    if(node.pid === parentPid){
        node.collapsed = false;
        if(childIndex !== node.children.length - 1){ //如果要删除的不是最后一个子节点，就需要更改其后面的节点的属性
            updateNodePidAndValue(node.children, childIndex, 0);
        }
        node.children.splice(childIndex, 1);
    }else{
        for(var sub in node.children){
            findParentAndDeleteSomeNode(node.children[sub], parentPid, childIndex);
        }
    }
}

// 将被删除的子节点后面的兄弟节点的pid和value属性做相应的更改(包括兄弟节点的子节点，因此要递归)
function updateNodePidAndValue(children, childIndex, num) {
    if(children == null){
        return;
    }
    for(var i=childIndex; i<children.length; i++){
        var oldPid = children[i].pid + "";
        var times = oldPid.split("\.");
        times[times.length-1-num]--;
        var newPid = times.join("\."); //join方法将数组转为字符串，中间加上分隔符
        children[i].pid = newPid;
        children[i].value = newPid; //pid与value是相等的
        updateNodePidAndValue(children[i].children, 0, num+1);
    }
}


// 输入的确认按钮绑定回车键
function bindEnterByUpdateMenu() {
    var button = $("#update-menu-ybtn");
    if(event.keyCode == 13)
    {
        button.click();
        event.returnValue = false;
    }
}
function bindEnterByAddMenu() {
    var button = $("#add-menu-ybtn");
    if(event.keyCode == 13)
    {
        button.click();
        event.returnValue = false;
    }
}