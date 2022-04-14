<template>
    <div style="display: flex; flex-direction: column;height:100%;">
        <a-page-header
                :ghost="false"
                title="工作台"
        >
            <template slot="tags">
                <a-tag color="blue">
                    管理员
                </a-tag>
            </template>
            <div class="header-container">
                <div class="header-container-left">
                    <img src="../assets/avatar.png" class="header-avatar" alt="">
                    <div class="header-container-left-info">
                        <div class="header-container-left-info-title">欢迎你，admin</div>
                        <div class="header-container-left-info-desc">软件部 | 卓元 - XXXX规范化平台</div>
                    </div>
                </div>
                <div class="header-container-right">
                    <a-statistic title="我的通知" value="102"/>
                    <a-divider type="vertical"  style="height: 100%;margin: 0 24px;"/>
                    <a-statistic title="我的审批" value="0"/>
                    <a-divider type="vertical" style="height: 100%;margin: 0 24px;"/>
                    <a-statistic title="我的邮箱" value="0"/>
                </div>
            </div>
        </a-page-header>
        <a-card title="系统动态" :bordered="false" style="margin-top: 1rem; flex: 1;">
            <a-list>
                <a-list-item :key="index" v-for="(item, index) in affairs">
                    <a-list-item-meta>
                        <a-avatar slot="avatar" :src="item.avatar"/>
                        <div slot="title">
                            <span>{{ item.author }}</span>&nbsp;
                            在&nbsp;<span>{{ item.time }}</span>&nbsp;发布
                            <span>{{ item.type }}</span>&nbsp;的系统信息
                        </div>
                        <div slot="description">{{ item.title }}</div>
                    </a-list-item-meta>
                </a-list-item>
            </a-list>

        </a-card>
    </div>
</template>

<script>
    export default {
        name: "Home2",
        data(){
            return {
                affairs:[
                    {
                        author: '管理员',
                        time: '2021-06-21 10:08:01',
                        type: '系统级事件',
                        title: '基础开发框架ews-boot发布',
                        avatar: require('../assets/avatar.png')
                    },
                    {
                        author: '管理员',
                        time: '2021-06-21 10:08:01',
                        type: '系统级事件',
                        title: '基础开发框架ews-boot发布',
                        avatar: require('../assets/avatar.png')
                    },
                    {
                        author: '管理员',
                        time: '2021-06-21 10:08:01',
                        type: '系统级事件',
                        title: '基础开发框架ews-boot发布',
                        avatar: require('../assets/avatar.png')
                    }
                ]
            }
        }
    }
</script>

<style scoped>
    .header-container{
        display: flex;
        justify-content: space-between;
        align-content: center;
    }
    .header-container-left{
        display: flex;
        flex: 1;
        align-content: center;
    }
    .header-avatar{
        display: block;
        width: 72px;
        height: 72px;
    }
    .header-container-left-info{
        display: flex;
        margin-left: 24px;
        flex-direction: column;
        justify-content: space-around;
    }
    .header-container-left-info-title{
        color: rgba(0,0,0,.85);
        font-weight: 500;
        font-size: 20px;
        line-height: 28px;
    }
    .header-container-left-info-desc{
        color: rgba(0,0,0,.45);
        line-height: 22px;
        font-size: 14px;
    }
    .header-container-right{
        display: flex;
        align-content: center;
    }
</style>