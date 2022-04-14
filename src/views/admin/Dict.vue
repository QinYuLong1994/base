<template>
    <div class="container">
        <div class="top_handle_area">
            <div class="row_item" style="justify-content: flex-start">
                <div class="search_item">
                    <div class="search_label">字典名称</div>
                    <a-input type="text" v-model="example.name" placeholder="请输入字典名称" class="search_area"></a-input>
                </div>
                <div class="search_item">
                    <a-button type="primary" @click="searchByDictName">查询</a-button>
                    <a-button @click="initData">初始化数据</a-button>
                    <a-button @click="clearData">清空数据</a-button>
                </div>
            </div>
        </div>
        <div class="bot_content_area">
            <div class="top_info">
                <div class="info_title">数据字典</div>
                <div class="info_handle">
                    <a-button @click="add.show">添加数据字典</a-button>
                    <a-button @click="collection.list.show">管理字典分类</a-button>
                </div>
            </div>
            <div class="table_area">
                <a-table :columns="columns"
                         :rowKey="record => record.id"
                         :dataSource="data"
                         :bordered="true"
                         :pagination="pagination"
                         @change="handleTableChange"
                >
                    <span slot="num" slot-scope="text, record, index">
                        {{ (pagination.current - 1) * pagination.pageSize + parseInt(index) + 1 }}
                    </span>
                    <span slot="action" slot-scope="record">
                        <a-button type="link" @click="deleteData(record)">删除</a-button>
                    </span>
                </a-table>
            </div>
        </div>

        <!--    分类列表    -->
        <a-drawer
                title="分类列表"
                :width="600"
                :visible="collection.list.visible"
                :body-style="{ paddingBottom: '80px'}"
                @close="collection.list.close"
                class="add_drawer"
        >
            <div class="top_info_area">
                <a-button @click="collection.add.show" type="primary">增加</a-button>
            </div>
            <a-table
                    :columns="collection.list.columns"
                    :dataSource="collection.list.data"
                    :rowKey="record => record.collection"
                    bordered
                    :pagination="false"
                    @change="handleTableChange"
            >
                <span slot="subNum" slot-scope="text, record, index">
                    {{  parseInt(index) + 1 }}
                </span>
            </a-table>

        </a-drawer>

        <!--    分类添加    -->
        <a-modal
                title="添加分类"
                v-model="collection.add.visible"
                okText="增加"
                cancelText="取消"
                width="30%"
                @ok="collection.add.ok"
                @cancel="collection.add.cancel"
        >
            <a-form  :labelCol="{ span: 5 }" :wrapperCol="{ span: 16, offset: 1 }">
                <a-form-item label="字典分类编码">
                    <a-input v-model="collection.add.form.collection" placeholder="字典分类编码不超过10位" type="text" />
                </a-form-item>
                <a-form-item label="字典分类名称">
                    <a-input v-model="collection.add.form.collectionName" placeholder="字典分类名称不超过10位" type="text" />
                </a-form-item>
            </a-form>
        </a-modal>


        <!--    数据添加    -->
        <a-modal
                title="添加字典"
                v-model="add.visible"
                okText="添加"
                cancelText="取消"
                width="30%"
                @ok="add.ok"
                @cancel="add.cancel"
        >
            <a-form :labelCol="{ span: 5 }" :wrapperCol="{ span: 16, offset: 1 }">
                <a-form-item label="数据类型">
                    <a-select  placeholder="数据类型" :allowClear="true" v-model="add.form.collection">
                        <a-select-option v-for="item in add.combo" :key="item.collection">{{ item.collection }}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="字典名">
                    <a-input type="text" v-model="add.form.name" placeholder="名称"></a-input>
                </a-form-item>
                <a-form-item label="字典值">
                    <a-input type="text" v-model="add.form.value" placeholder="值"></a-input>
                </a-form-item>
                <a-form-item label="字典排序">
                    <a-input-number v-model="add.form.sort" placeholder="排序"></a-input-number>
                </a-form-item>
            </a-form>
        </a-modal>

    </div>
</template>

<script>

    const columns = [
        {
            title: '序号',
            scopedSlots: {customRender: 'num'},
        },
        {
            title: '字典类型',
            dataIndex: 'collection',
        },
        {
            title: '字典名称',
            dataIndex: 'name',
        },
        {
            title: '字典值',
            dataIndex: 'value',
        },
        {
            title: '字典排序',
            dataIndex: 'sort',
        },
        {
            title: '创建时间',
            dataIndex: 'created',
        },
        {
            title: '操作',
            scopedSlots: {customRender: 'action'},
            align: 'center',
        },
    ];
    export default {
        name: "dict",
        data() {
            return {
                columns,
                data: [],
                pagination: {
                    pageSize: 10,
                    current: 1,
                    total: 0
                },
                example: {},

                collection: {
                    add:{
                        visible: false,
                        show: () => {
                            this.collection.add.form = {}
                            this.collection.add.visible = true
                        },
                        form: {},
                        ok: () => {
                            this.$http.post('/framework/admin/dict/collection/add', this.collection.add.form).then(res => {
                                if (res.success) {
                                    this.collection.add.visible = false
                                    this.$message.info("添加成功！")
                                    this.collection.list.fetch()
                                }
                            })
                        },
                        cancel: () => {
                            this.collection.add.visible = false
                        }
                    },
                    list:{
                        visible: false,
                        columns:[
                            {
                                title: '序号',
                                scopedSlots: {customRender: 'subNum'},
                            },
                            {
                                title: '字典类型',
                                dataIndex: 'collection',
                            },
                            {
                                title: '字典名称',
                                dataIndex: 'collectionName',
                            },
                        ],
                        data: [],
                        show: ()=>{
                            this.collection.list.visible = true
                            this.collection.list.fetch()
                        },
                        close: ()=>{
                            this.collection.list.visible = false
                        },
                        fetch: ()=>{
                            this.$http.get('/framework/admin/dict/collection/list').then(res=>{
                                if (res.success){
                                    this.collection.list.data = res.data
                                }
                            })
                        }
                    }

                },

                add:{
                    visible: false,
                    show: ()=>{
                        this.add.visible = true
                        this.add.fetchCombo()
                        this.add.form = {}
                    },
                    form:{},
                    ok: ()=>{
                        this.$http.post('/framework/admin/dict/add', this.add.form).then(res=>{
                            if (res.success){
                                this.add.visible = false
                                this.$message.success('添加成功');
                                this.fetch()
                            }
                        })
                    },
                    cancel: ()=>{
                        this.add.visible = false
                    },
                    combo: [],
                    fetchCombo:()=>{
                        this.$http.get('/framework/admin/dict/collection/list').then(res=>{
                            if (res.success){
                                this.add.combo = res.data
                            }
                        })
                    }
                }
            }
        },
        mounted() {
            this.fetch()
            this.$on('tenantChange', ()=>{
                this.fetch()
            })
        },
        methods: {
            handleTableChange(pagination, filters) {
                const pager = {...this.pagination};    //---防止对象引用复制---
                pager.current = pagination.current;
                this.pagination = pager;

                const result = {};
                const filterKeys = Object.keys(filters);
                for (let i = 0; i < filterKeys.length; i++) {
                    result[filterKeys[i]] = filters[filterKeys[i]][0];
                }
                this.filters = {
                    ...this.filters,
                    ...result,
                };

                this.fetch();
            },
            // 获取字典列表数据
            fetch() {
                this.loading = true;

                const data = {
                    size: this.pagination.pageSize,
                    page: this.pagination.current,
                    example: this.example,
                };
                const that = this;
                this.$http.post('/framework/admin/dict/list', data).then(res => {
                    if (res.success) {
                        const data = res.data;
                        const pagination = {...that.pagination};
                        pagination.total = data.total;
                        that.loading = false;
                        that.data = data.result;
                        that.pagination = pagination;
                    }
                }).catch(function (error) {
                    if (error.response) {
                        // 请求已发出，但服务器响应的状态码不在 2xx 范围内
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        console.log('Error', error.message);
                    }
                    console.log(error.config);
                    if (error.response.status === 401) {
                        that.$message.error('当前用户的角色，不允许访问该数据！');
                    }
                    that.loading = false;
                });

            },

            initData(){
                this.$http.get('/framework/admin/dict/init').then(res=>{
                    if (res.success){
                        this.$message.success('数据初始化成功！')
                        this.fetch()
                    }
                })
            },

            clearData(){
                this.$http.get('/framework/admin/dict/clear').then(res=>{
                    if (res.success){
                        this.$message.success('数据初始化成功！')
                        this.fetch()
                    }
                })
            },

            searchByDictName(){
                this.fetch()
            },

            deleteData(record){
                let ids = JSON.stringify([record.id])
                this.$http.get('/framework/admin/dict/delete?ids='+ids).then(res=>{
                    if (res.success){
                        this.$message.success('删除成功！')
                        this.fetch()
                    }
                })

            }


        }
    }
</script>

<style lang="scss" scoped>

    .ant-table-wrapper {
        .ant-table-content {
            background: white;
        }
    }

    .ant-table td {
        white-space: nowrap;
    }

    /deep/ .ant-table-thead > tr > th {
        padding: 10px 10px !important;
    }

    /deep/ .ant-table-tbody > tr > td {
        padding: 8px 16px !important;
    }

    .top_handle_area {
        width: 100%;
        min-height:64px;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        padding: 15px;
        margin-bottom: 2vh;
        .row_item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .search_item {
                display: flex;
                align-items: center;
                width: 24%;
                margin-right: 20px;
                .search_label {
                    margin-right: 10px;
                }
                .search_area {
                    flex: 1;
                }
                button {
                    min-width: 80px;
                    margin-right: 20px;
                }
                .submit_area {
                    font-size: 16px;
                    color: #347DF7;
                    cursor: pointer;
                }
            }
        }
    }

    .bot_content_area {
        width: 100%;
        margin-top: 16px;
        background: #ffffff;
        min-height: 625px;
        padding: 0 20px;

        .top_info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: 60px;
            border-bottom: 1px solid #dfdfdf;
            padding: 0 4px;
            margin-bottom: 10px;

            .info_title {
                width: 120px;
                font-size: 18px;
                font-weight: bolder;
            }

            .info_handle button {
                margin-left: 20px;
                color: #1890FF;
                border-color: #1890FF;
            }
        }
    }

    .add_drawer {
        .top_info_area {
            display: flex;
            align-items: center;
            margin-bottom: 16px;

            .record_msg {
                font-weight: bold;
            }
        }
    }

</style>