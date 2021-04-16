<template>
    <div class="container">
        <div class="slide">
            <div class="item" v-for="(item, index) in classList" :key="item.id" :class="{active: activeIndex===index}">
                <p class="title" v-if="!item.edit" @click="classActive(item,index)">{{item.name}}</p>
                <input class="title-input" v-if="item.edit && activeIndex===index" v-model="item.name" :ref="`input${index}`" @keyup.enter="classBlur(index)" @blur="classBlur(index)"/>
            </div>
            <span class="add" @click="addClass">添加列表</span>
        </div>
        <div class="main">
            <div class="title">{{activeItem.name}} <span class="add-mater" @click="addMaster" v-if="status!==2">添加</span></div>
            <!-- 事项列表 -->
            <div class="master-classList" v-click-outside="masterItemClickoutside">
                <div class="master-item" :class="{active: activeMasterIndex === index}" v-for="(item, index) in masterList" :key="index" @click="activeMasterIndex = index">
                    <span class="finish-btn" @click="toggleFinish(item)">
                        <span :class="{active: item.status === 2 || !!item.finish_time}"></span>
                    </span>
                    <div class="info">
                        <p>
                            <span class="priority">{{priorityText(item)}}</span>
                            <input class="content" type="text" v-model="item.master_name" :ref="`masterInput${index}`" @keyup.enter="masterBlur(item, index)" @blur="masterBlur(item, index)"/>
                        </p>
                        <span v-if="item.clockTime">今天上午 10:21</span>
                        <span v-if="item.remark">{{item.remark || ''}}</span>
                    </div>
                    <span class="icon" v-if="item.master_name" :ref="`detailIcon${index}`" @click="detail(index)">详情</span>
                </div>
            </div>
            <!-- 弹出框 -->
            <div class="popover" v-if="popoverTop !== 0" :style="{top: popoverTop+'px'}">
                <div class="triangle"></div>
                <div class="content">
                    <div class="section">
                        <input type="text" class="title" v-model="editItem.master_name"/>
                    </div>
                    <div class="section">
                        <p><span class="do">提醒我</span></p>
                    </div>
                    <div class="section">
                        <p><span class="do">优先级</span>
                            <select v-model="editItem.priority">
                                <option value="0">无</option>
                                <option value="1">低</option>
                                <option value="2">中</option>
                                <option value="3">高</option>
                            </select>
                        </p>
                        <p><span class="do">备注</span><input type="text" v-model="editItem.remark" placeholder="无"></p>
                    </div>
                    <div class="section">
                        <button @click="hidePopover">完成</button>
                    </div>
                </div>
            </div>
            <!-- <button @click="initMenu" id="test">测试闹钟</button> -->
        </div>
    </div>
</template>

<script>
import { getClassList, addClass, updateClass, addMaster, getMasterList, updateMaster } from '../lib/db.js'
const Electron = require('electron').remote
const { Menu, MenuItem } = Electron
const notifier = require('node-notifier');

export default {
    components: {},
    data() {
        return {
            classList: [],
            masterList: [],
            activeIndex: 0,
            enterFlag: false,
            popoverTop: 0,
            editItem: {},
            activeMasterIndex: -1
        };
    },
    created() {
        this.getClassList()
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            console.log('e', e );
            if (e.target && e.target.className.indexOf('master-item') > -1) {
                this.initMenu()
            }
        })
    },
    computed: {
        activeItem() {
            if (this.activeIndex === -1) return {}
            else return this.classList[this.activeIndex]
        },
        status() {
            return this.classList[this.activeIndex].id
        }
    },
    methods: {
        masterItemClickoutside() {
            this.activeMasterIndex = -1
        },
        initMenu() {
            if (this.activeMasterIndex === -1) return
            let item = this.masterList[this.activeMasterIndex]
            this.updateStatus(item)
        },
        updateStatus(item) {
            this.menu = new Menu();
            this.menu.append(new MenuItem(
                { label: '删除', click: function() {
                        console.log('delete');
                    }
                })
            );
            let label = item.status == 1 || !item.finish_time ? '标记为已完成' : '标记为未完成'
            this.menu.append(new MenuItem({ label: label, click: () => {
                        console.log('finish');
                        this.toggleFinish({
                            ...this.masterList[this.activeMasterIndex],
                            status: item.status
                        })
                    }
                }))

            this.menu.popup(Electron.getCurrentWindow());
        },
        priorityText(item) {
            return '!'.repeat(+item.priority)
        },
        test() {
            var nc = new notifier.NotificationCenter();
            let notifyLater = '五分钟后再提醒'
            nc.notify({
                title: 'title',
                message: 'message',
                sound: true,
                closeLabel: '完成',
                actions: notifyLater
            }, 
            function (err, response, metadata) {
                // Response is response from notification
                // Metadata contains activationType, activationAt, deliveredAt activationValue
                console.log('metadata', metadata);
                if (metadata.activationValue === notifyLater) {

                }
            })
        },
        detail(index) {
            // reset
            this.popoverTop = 0
            let ref = this.$refs[`detailIcon${index}`]
            if (ref) {
                // console.log('object', ref[0].getBoundingClientRect());
                let { top } = ref[0].getBoundingClientRect()
                this.popoverTop = top + 30
                this.editItem = this.masterList[index]
            }
        },
        hidePopover() {
            this.popoverTop = 0
            this.updateMasterRequest(thie.editItem)
            this.editItem = {}
        },
        toggleFinish(item) {
            if ((item.status===1 || item.status === 2)) {
                item.status = item.status === 2 ? 1 : 2
                setTimeout(() => {
                    this.updateMasterRequest({
                        id: item.id,
                        status: item.status
                    })
                }, 500)
            } else {
                let time = item.finish_time ? '' : Date.now()
                setTimeout(() => {
                    this.updateMasterRequest({
                        id: item.id,
                        finish_time: time
                    })
                }, 100)
            }
        },
        masterBlur(item, index) {
            if (this.enterFlag) {
                this.enterFlag = false
                return
            }
            this.enterFlag = true
            if (item.id) {
                this.updateMasterRequest(item)
            } else {
                addMaster(item).then(() => {
                    this.getMasterList()
                })
            }
            this.$nextTick(() => {
                let ref = this.$refs[`masterInput${index}`]
                if (ref) {
                    ref[0].blur()
                }
            })
        },
        updateMasterRequest(obj) {
            updateMaster(obj).then(res => {
                this.getMasterList()
            })
        },
        addMaster() {
            let item = this.masterList[this.masterList.length - 1]
            if (item && !item.master_name) return
            this.masterList.push({
                master_name: '',
                status: this.status
            })
            this.$nextTick(() => {
                let ref = this.$refs[`masterInput${this.masterList.length - 1}`]
                if (ref) {
                    ref[0].focus()
                }
            })
        },
        classActive(item, index) {
            if (this.activeIndex === index) {
                this.$set(this.classList, index, {
                    ...item,
                    edit: true
                })
                this.$nextTick(() => {
                    let ref = this.$refs[`input${index}`]
                    if (ref) {
                        ref[0].focus()
                    }
                })
            } else {
                this.activeIndex = index
                this.classList.forEach(item => {
                    item.edit = false
                })
                this.getMasterList()
            }
        },
        classBlur(index) {
            // reset
            this.classList.forEach(item => {
                item.edit = false
            })
            let item = this.classList[index]
            updateClass({
                id: item.id,
                name: item.name
            })
        },
        getMasterList() {
            getMasterList({
                status: this.status
            }).then(res => {
                if (res.code === 0) {
                    this.masterList = res.data
                }
            })
        },
        async getClassList() {
            let res = await getClassList()
            if (res.code === 0) {
                this.classList = res.data
                this.getMasterList()
            }
        },
        addClass() {
            addClass({
                name: '新建列表'
            }).then(() => {
                this.getClassList()
            })
        }
    }
};
</script>

<style lang="scss" scoped>
    .container {
        display: flex;
        width: 100%;
        height: 100vh;
        .slide {
            padding-top: 30px;
            background: #bdc3c7;
            width: 200px;
            border-right: 1px solid #95a5a6;
            .item {
                padding-left: 10px;
                cursor: default; // 鼠标样式
                color: #2c3e50;
                &.active {
                    background: #2980b9;
                    color: #fff;
                }
                .title {
                    font-size: 13px;
                    font-weight: bold;
                    margin-bottom: 6px;
                }
                .title-input {
                    width: 90%;
                    padding: 3px 5px;
                }
            }
            .add {
                position: absolute;
                bottom: 10px;
                left: 10px;
                font-size: 14px;
            }
        }
        .main {
            background: #fff;
            flex: 1;
            padding: 15px 5px 0 0;
            position: relative;
            .title {
                font-size: 22px;
                padding: 0px 0 10px 10px;
                border-bottom: 1px solid #d8d8d8;
                .add-mater {
                    float: right;
                    font-size: 12px;
                    margin-top: 8px;
                    margin-right: 15px;
                    cursor: default;
                }
            }
            .master-classList {
                // padding-left: 25px;
                .master-item {
                    border-bottom: 1px solid #d8d8d8;
                    padding: 5px 0;
                    font-size: 14px;
                    position: relative;
                    display: flex;
                    align-items: center;
                    min-height: 30px;
                    padding-left: 35px;
                    &.active {
                        background: #d8d8d8;
                    }
                    .finish-btn {
                        position: absolute;
                        left: 10px;
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        border: 1px solid #bdc3c7;
                        .active {
                            width: 10px;
                            height: 10px;
                            border-radius: 50%;
                            display: inline-block;
                            background: #409eff;
                            position: absolute;
                            left: 2px;
                            top: 2px;
                        }
                    }
                    .info {
                        display: flex;
                        flex-direction: column;
                        font-size: 12px;
                        color: #7f8c8d;
                        span {
                            line-height: 16px;
                        }
                        .content {
                            color: #000;
                            border: none;
                            outline:none;
                            font-size: 12px;
                            background: transparent;
                        }
                    }
                    .icon {
                        position: absolute;
                        right: 10px;
                        top: 50%;
                        transform: translate(0px, -50%);
                        cursor: default;
                        font-size: 13px;
                    }
                }
            }
            .popover {
                position: absolute;
                width: 250px;
                height: 200px;
                background: #bdc3c7;
                right: 10px;
                border-radius: 3px;
                .triangle {
                    position: absolute;
                    width: 0;
                    height: 0;
                    top: -20px;
                    border-top: 10px solid transparent;
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-bottom: 10px solid #bdc3c7;
                    right: 10px;
                }
                .content {
                    width: 100%;
                    height: 100%;
                    padding: 10px 5px;
                    display: flex;
                    flex-direction: column;
                    input {
                        outline: none;
                        border: none;
                        background: none;
                    }
                    .section {
                        &:not(:last-child) {
                            border-bottom: 1px solid #d8d8d8;
                        }
                        &:first-child {
                            height: 30px;
                        }
                        &:nth-of-type(2) {
                            flex: 1;
                            p {
                                padding-top: 5px;
                            }
                        }
                        &:nth-of-type(3) {
                            height: 60px;
                            p {
                                padding-top: 5px;
                            }
                        } 
                        &:last-child {
                            height: 30px;
                            display: flex;
                            align-items: center;
                            justify-content: flex-end;
                            button {
                                width: 40px;
                                height: 25px;
                                line-height: 25px;
                            }
                        }
                        .do {
                            font-size: 12px;
                            margin-right: 5px;
                        }
                    }
                    .title {
                        font-size: 16px;
                    }
                }
            }
        }
    }
</style>
