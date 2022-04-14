<template>
    <a-spin :spinning="spinning">
        <div class="container">
            <div class="top_handle_area">
                <div class="row_item" style="justify-content: flex-start">
                    <div class="search_item" style="width: 30%;">
                        <div class="search_label">关键词</div>
                        <a-input style="width: 300px;" placeholder="请输入关键词" v-model="keywords"/>
                    </div>
                    <div class="search_item">
                        <a-button icon="search" type="primary" @click="onSearch">搜索</a-button>
                        <a-button icon="redo" html-type="submit" @click="handleReset">重置</a-button>
                    </div>
                </div>
            </div>
            <div class="bot_content_area">
                <div class="top_info">
                    <div class="info_title">控制点管理</div>
                    <div class="info_handle">
                        <a-button @click="autoCreate" :loading="autoCreating">自动创建控制点</a-button>
                    </div>
                </div>
                <div class="table_area">
                    <a-table :columns="columns"
                             :rowKey="record => record.id"
                             :dataSource="data"
                             :bordered="true"
                             :loading="loading"
                             :pagination="pagination"
                             :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '暂无数据'}"
                             @change="handleTableChange"
                             :scroll="{ x: true }"
                    >
                        <span slot="actionSlot" slot-scope="text,record">
                           <a-button type="link" @click="edit.show(record)" style="margin-right: 15px">修改</a-button>
                        </span>
                    </a-table>
                </div>
            </div>
        </div>

        <a-drawer title="更新控制点"
                  :width="700"
                  :visible="edit.visible"
                  class="drawer"
                  @close="edit.visible = false"
        >
            <a-form>
                <a-form-item :labelCol="{ span: 5 }" :wrapperCol="{ span: 18, offset: 1 }" label='控制点名称'>
                    <a-input type="text" v-model="edit.form.name" placeholder="名称"></a-input>
                </a-form-item>
                <a-form-item :labelCol="{ span: 5 }" :wrapperCol="{ span: 18, offset: 1 }" label='控制点编码'>
                    <a-input type="text" v-model="edit.form.code" placeholder="请依据授权情况进行填写"></a-input>
                </a-form-item>
            </a-form>
            <div class="handle_area">
                <a-button style="margin-right: 30px" @click="edit.visible = false">取消</a-button>
                <a-button type="primary" @click="edit.update()">保存</a-button>
            </div>
        </a-drawer>
    </a-spin>

</template>

<script>

    const columns = [
        // {
        //     title: '控制点ID',
        //     dataIndex: 'id',
        //     width: 200
        // },
        {
            title: '控制点名称',
            dataIndex: 'name',
            width: 120
        },
        {
            title: '控制点编码',
            dataIndex: 'code',
            width: 160
        },
        {
            title: '编码路径',
            dataIndex: 'codePath'
        },
        {
            title: '编码方法名',
            dataIndex: 'codeMethodName'
        },
        {
            title: '编码类名',
            dataIndex: 'codeClassName'
        },
        {
            title: '编码方法权限',
            dataIndex: 'codeMethodAuth',
            width: 160
        },
        {
            title: '编码类权限',
            dataIndex: 'codeClassAuth',
            width: 160
        },
        {
            title: '操作',
            key: 'action',
            scopedSlots: {customRender: 'actionSlot'},
        }
    ];

    export default {
        mounted() {
            this.fetch();
        },
        data() {
            return {
                spinning: false,
                columns,
                data: [],
                pagination: {
                    pageSize: 10,
                    current: 1,
                    total: 0
                },
                loading: false,
                selectedRowKeys: [],
                filters: {},
                query:[],

                autoCreating: false,

                edit:{
                    form:{},
                    visible: false,
                    show:(record)=>{
                        this.edit.form = {...record}
                        this.edit.visible = true
                    },
                    update:()=>{
                        this.$http.post('/framework/admin/sysController/update', this.edit.form).then(res=>{
                            this.edit.visible = false
                            if (res.success){
                                this.$message.success("更新成功")
                                this.fetch()
                            }
                        })
                    }
                },

                keywords: null,

            }
        },
        methods: {
            handleTableChange(pagination, filters, sorter) {
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
                    ...result
                };

                this.fetch({
                    size: pagination.pageSize,
                    page: pagination.current,
                    sort:{
                        field: sorter.field,
                        order: sorter.order
                    }
                });
            },
            fetch(params = {}) {
                this.loading = true;

                const data = {
                    size: this.pagination.pageSize,
                    page: this.pagination.current,
                    example: this.filters,
                    query: this.query,
                    ...params,
                };

                const that = this;
                this.$http.post('/framework/admin/sysController/list', data).then( res =>  {
                    if (res.success){

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
            onSelectChange(selectedRowKeys) {
                this.selectedRowKeys = selectedRowKeys;
            },

            autoCreate() {
                this.autoCreating = true;
                this.$http.get('/framework/admin/sysController/autoCreate', this.updateForm).then(res => {
                    this.autoCreating = false
                    if (res.success) {
                        this.fetch();
                        this.$message.success('更新成功！', 2);
                    } else {
                        this.$message.error(res.msg, 2);
                    }
                });
            },


            //---search---
            onSearch() {
                if (!this.keywords){
                    this.$message.warn("关键词为空")
                    return false
                }
                this.pagination.current = 1;
                this.query = [
                    {
                        fieldName: 'name',
                        operator: 'LIKE',
                        value: this.keywords
                    },
                    {
                        fieldName: 'code',
                        operator: 'LIKE',
                        value: this.keywords
                    },
                    {
                        fieldName: 'codePath',
                        operator: 'LIKE',
                        value: this.keywords
                    },
                  {
                    fieldName: 'codeMethodName',
                    operator: 'LIKE',
                    value: this.keywords
                  }
                ];

                this.fetch();
            },

            handleReset(){
                this.pagination.current = 1;
                this.filters = {}
                this.query = []
                this.keywords = null
                this.fetch();
            }

        },

        computed: {
            selectRows() {
                return JSON.stringify(this.selectedRowKeys);
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
        padding: 10px 16px !important;
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

    .drawer {
        .head_area {
            display: flex;
            align-items: center;
            margin-bottom: 15px;

            .left_name {
                font-size: 16px;
                margin-right: 20px;
                font-weight: bold;
            }
        }

        .handle_area {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 100%;
            border-top: 1px solid #e9e9e9;
            padding: 10px 16px;
            background: #fff;
            text-align: center;
            z-index: 1;
        }
    }

</style>
