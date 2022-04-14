<template>
    <div class="container">
        <div class="block">
            <div class="header">
                <div class="title">表数据管理</div>
                <a-button type="primary" @click="sysTable.autoTake">
                    <div>自动提取表数据</div>
                </a-button>
            </div>
            <div class="body">
                <a-table :columns="sysTable.columns"
                         :rowKey="record => record.id"
                         :dataSource="sysTable.data"
                         :pagination="sysTable.pagination"
                         :loading="sysTable.loading"
                         :rowSelection="{selectedRowKeys: sysTable.selectedRowKeys, onChange: sysTable.onSelectChange}"
                         :bordered="true"
                         class="brand-list"
                         @change="sysTable.handleTableChange"
                         :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '暂无数据'}"
                         :scroll="{ x: true }"
                >
                </a-table>
            </div>
        </div>
        <div class="block">
            <div class="header">
                <div class="title">列数据管理</div>
                <a-button type="primary" @click="sysColumn.autoTake">
                    <div>自动提取列数据</div>
                </a-button>
            </div>
            <div class="body">
                <a-table :columns="sysColumn.columns"
                         :rowKey="record => record.id"
                         :dataSource="sysColumn.data"
                         :pagination="sysColumn.pagination"
                         :loading="sysColumn.loading"
                         :rowSelection="{selectedRowKeys: sysColumn.selectedRowKeys, onChange: sysColumn.onSelectChange}"
                         :bordered="true"
                         class="brand-list"
                         @change="sysColumn.handleTableChange"
                         :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '暂无数据'}"
                         :scroll="{ x: true }"
                >
                </a-table>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "SysTable",
    data() {
        return {
            sysTable: {
                columns: [
                    {
                        title: '表名',
                        dataIndex: 'name'
                    },
                    {
                        title: '类名',
                        dataIndex: 'entity'
                    },
                    {
                        title: '备注',
                        dataIndex: 'note'
                    }
                ],
                pagination: {
                    pageSize: 10,
                    page: 1,
                    total: 0
                },
                loading: false,
                selectedRowKeys: [],
                example: {},
                query: [],
                data: [],
                handleTableChange: (pagination, filters) => {
                    const pager = {...this.sysTable.pagination};    //---防止对象引用复制---
                    pager.page = pagination.current;
                    this.sysTable.pagination = pager;

                    const example = {}
                    const filterKeys = Object.keys(filters);
                    for (let i = 0; i < filters.length; i++) {
                        example[filterKeys[i]] = filters[filterKeys[i]][0];
                    }
                    this.sysTable.example = {
                        ...this.sysTable.example,
                        ...example
                    }

                    this.sysTable.fetch()

                },
                onSelectChange: (selectedRowKeys)=>{
                    this.sysTable.selectedRowKeys = selectedRowKeys
                    if (selectedRowKeys.length === 1){
                        this.sysColumn.example.tableId = selectedRowKeys[0]
                    }else {
                        this.sysColumn.example={}
                    }
                    this.sysColumn.pagination.page = 1
                    this.sysColumn.pagination.current = 1
                    this.sysColumn.fetch()
                },
                fetch: (params = {}) => {
                    this.sysTable.loading = true

                    const data = {
                        size: this.sysTable.pagination.pageSize,
                        page: this.sysTable.pagination.page,
                        example: this.sysTable.example,
                        query: this.sysTable.query,
                        ...params
                    }

                    this.$http.post("/framework/admin/source/sysTable/list", data).then(res => {
                        this.sysTable.loading = false;
                        if (res.success) {
                            const data = res.data
                            const pagination = {...this.sysTable.pagination}
                            pagination.total = data.total;
                            this.sysTable.data = data.result
                            this.sysTable.pagination = pagination
                        } else {
                            this.$message.error(res.msg, 2)
                        }
                    }).catch(error => {
                        this.sysTable.loading = false;
                        if (error.response) {
                            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
                            console.log(error.response.status);
                            console.log(error.response.headers);
                        } else {
                            // Something happened in setting up the request that triggered an Error
                            console.log('Error', error.message);
                        }
                        console.log(error.config);


                        if (error.response && error.response.status === 403) {
                            this.$message.error('当前用户的角色，不允许访问该数据！');
                        }
                    })
                },
                autoTake: ()=>{
                    this.$http.get("/framework/admin/source/sysTable/autoTake").then(res =>{
                        if (res.success){
                            this.$message.success("提取成功")
                            this.sysTable.fetch()
                        }else {
                            this.$message.error(res.msg, 2)
                        }
                    })
                }
            },
            sysColumn: {
                columns: [
                    {
                        title: '表名',
                        dataIndex: 'tableName'
                    },
                    {
                        title: '列名',
                        dataIndex: 'name'
                    },
                    {
                        title: '属性名',
                        dataIndex: 'field'
                    },
                    {
                        title: '属性类型',
                        dataIndex: 'fieldType'
                    },

                ],
                pagination: {
                    pageSize: 10,
                    page: 1,
                    total: 0
                },
                loading: false,
                selectedRowKeys: [],
                example: {
                    tableId: null
                },
                query: [],
                data: [],
                handleTableChange: (pagination, filters) => {
                    console.log(pagination)
                    const pager = {...this.sysColumn.pagination};    //---防止对象引用复制---
                    pager.page = pagination.current;
                    this.sysColumn.pagination = pager;

                    const example = {}
                    const filterKeys = Object.keys(filters);
                    for (let i = 0; i < filters.length; i++) {
                        example[filterKeys[i]] = filters[filterKeys[i]][0];
                    }
                    this.sysColumn.example = {
                        ...this.sysColumn.example,
                        ...example
                    }

                    this.sysColumn.fetch()

                },
                onSelectChange: (selectedRowKeys)=>{
                    this.sysColumn.selectedRowKeys = selectedRowKeys
                },
                fetch: (params = {}) => {
                    this.sysColumn.loading = true

                    const data = {
                        size: this.sysColumn.pagination.pageSize,
                        page: this.sysColumn.pagination.page,
                        example: this.sysColumn.example,
                        query: this.sysColumn.query,
                        ...params
                    }

                    this.$http.post("/framework/admin/source/sysColumn/list", data).then(res => {
                        this.sysColumn.loading = false;
                        if (res.success) {
                            const data = res.data
                            const pagination = {...this.sysColumn.pagination}
                            pagination.total = data.total;
                            this.sysColumn.data = data.result
                            this.sysColumn.pagination = pagination
                        } else {
                            this.$message.error(res.msg, 2)
                        }
                    }).catch(error => {
                        this.sysTable.loading = false;
                        if (error.response) {
                            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
                            console.log(error.response.status);
                            console.log(error.response.headers);
                        } else {
                            // Something happened in setting up the request that triggered an Error
                            console.log('Error', error.message);
                        }
                        console.log(error.config);


                        if (error.response && error.response.status === 403) {
                            this.$message.error('当前用户的角色，不允许访问该数据！');
                        }
                    })
                },
                autoTake: ()=>{
                    this.$http.get("/framework/admin/source/sysColumn/autoTake").then(res =>{
                        if (res.success){
                            this.$message.success("提取成功")
                            this.sysColumn.fetch()
                        }else {
                            this.$message.error(res.msg, 2)
                        }
                    })
                }
            }
        }
    },
    mounted() {
        this.sysTable.fetch()
        this.sysColumn.fetch()
        this.$on('tenantChange', ()=>{
          this.sysTable.fetch()
          this.sysColumn.fetch()
        })
    },
    methods: {
        //---获取路由信息列表---
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
    padding: 10px 16px !important;
}

/deep/ .ant-table-tbody > tr > td {
    padding: 8px 16px !important;
}

.container{
    display: flex;
    width: 100%;
    min-height: 100%;
    .block{
        background-color: white;
        flex: 1;
        margin: 10px;
        padding: 0 20px;
        display: flex;
        flex-direction: column;

        .header{
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 60px;
            border-bottom: 1px solid #dfdfdf;
            padding: 0 10px;

            .title{
                font-size: 18px;
                font-weight: bold;
            }
        }

        .body{
            margin-top: 10px;
            flex: 1;
        }
    }
}

</style>
