<template>
    <a-spin :spinning="spinning">
        <div class="container">
            <div class="bot_content_area">
                <div class="top_info">
                    <div class="info_title">权限目录</div>
                    <div class="info_handle">
                        <a-button @click="createAuthorityList" v-show="userinfo.role === 'ROLE_admin'">自动创建权限目录</a-button>
                        <a-button @click="add.show">增加</a-button>
                    </div>
                </div>
                <div class="table_area">
                    <a-table :columns="columns"
                             v-if="data != null"
                             :rowKey="record => record.id"
                             :dataSource="data"
                             :defaultExpandAllRows="false"
                             :bordered="true"
                             class="contentCat-list"
                             :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '暂无数据'}"
                    >
                <span slot="leafSlot" slot-scope="text">
                    <span v-if="text">是</span>
                    <span v-if="!text">否</span>
                </span>
                        <span slot="actionSlot" slot-scope="text,record">
                    <a-button type="link" @click="edit.show(record)" style="margin-right: 15px">编辑</a-button>
                    <a-button type="link" @click="delRecord(record)">删除</a-button>
                </span>
                    </a-table>
                </div>
            </div>
        </div>

        <a-drawer
                :title="modalTitle"
                placement="right"
                :width="700"
                :visible="visible"
                class="drawer"
                @close="drawerClose"
        >
            <a-form-model ref="ruleForm" :rules="rules" :model="form" style="padding-bottom: 10px;">
                <a-form-model-item label="上级目录:" prop="parentId">
                    <a-tree-select
                            v-model="form.parentId"
                            style="width: 100%"
                            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                            :treeData="treeData"
                            @select="treeSelect"
                            placeholder="请选择上级目录"
                            allow-clear
                            tree-default-expand-all>
                    </a-tree-select>
                </a-form-model-item>
                <a-form-model-item label="权限名称" prop="title" class="halfBox">
                    <a-input v-model="form.title" class="inputStyle" placeholder="请输入权限名称"/>
                </a-form-model-item>
                <a-form-model-item label='显示顺序' prop="sort" class="halfBox">
                    <a-input-number v-model="form.sort" class="inputStyle" :min="1" style="width:100%" :precision="0"
                                    placeholder="请输入显示顺序"></a-input-number>
                </a-form-model-item>
                <a-form-model-item label="是否叶子节点" prop="leaf" class="halfBox">
                    <a-radio-group v-model="form.leaf" class="inputStyle">
                        <a-radio :value="false" :key="false">否</a-radio>
                        <a-radio :value="true" :key="true">是</a-radio>
                    </a-radio-group>
                </a-form-model-item>
                <a-divider v-if="form.leaf" />
                <a-form-model-item v-if="form.leaf">
                    <a-button type="primary" @click="sysController.showModal">选择控制点</a-button>
                    <a-button @click="sysController.clear" style="margin: 0px 10px">清空控制点</a-button>
                </a-form-model-item>

                <a-form-model-item label='权限编码' prop="code" class="halfBox" v-if="form.leaf">
                    <a-input type="text" v-model="form.code" class="inputStyle" :disabled="true" placeholder="请输入权限编码"/>
                </a-form-model-item>
                <a-form-model-item label='控制点ID' prop="sysControllerId" class="halfBox" v-if="form.leaf">
                    <a-input type="text" v-model="form.sysControllerId" class="inputStyle" :disabled="true"
                             placeholder="请选择控制点ID"/>
                </a-form-model-item>
            </a-form-model>

            <div class="handle_area">
                <a-button @click="drawerClose" style="margin-right: 30px">取消</a-button>
                <a-button type="primary" @click="handleAddOk">保存</a-button>
            </div>

        </a-drawer>

        <a-modal title="选择控制点" v-model="sysController.visible" okText="保存" cancelText="取消" width="70%">

            <div class="select-table col-sm-12">
                <a-table :columns="sysController.columns"
                         :rowKey="record => record.id"
                         :dataSource="sysController.data"
                         :defaultExpandAllRows="true"
                         :bordered="true"
                         :customRow="sysController.rowClick"
                         :pagination="pagination"
                         :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '暂无数据'}"
                         @change="sysController.handleTableChange"
                >
                    <div
                            slot="filterDropdown"
                            slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
                            style="padding: 8px"
                    >
                        <a-input
                                v-ant-ref="c => (sysController.searchInput = c)"
                                :placeholder="`Search ${column.title}`"
                                :value="selectedKeys[0]"
                                style="width: 188px; margin-bottom: 8px; display: block;"
                                @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                                @pressEnter="() => sysController.handleSearch(selectedKeys, confirm, column.dataIndex)"
                        />
                        <a-button
                                type="primary"
                                icon="search"
                                size="small"
                                style="width: 90px; margin-right: 8px"
                                @click="() => sysController.handleSearch(selectedKeys, confirm, column.dataIndex)"
                        >搜索
                        </a-button>
                        <a-button size="small" style="width: 90px"
                                  @click="() => sysController.handleContollerReset(clearFilters,column.dataIndex)">
                            重置
                        </a-button>
                    </div>
                    <a-icon
                            slot="filterIcon"
                            slot-scope="filtered"
                            type="search"
                            :style="{ color: filtered ? '#108ee9' : undefined }"
                    />
                </a-table>
            </div>
        </a-modal>

    </a-spin>
</template>

<script>
    const columns = [
        {
            title: '名称',
            dataIndex: 'title',
            align: 'left'
        }, {
            title: '编码',
            dataIndex: 'code',
            align: 'left'
        }, {
            title: '层级',
            dataIndex: 'level',
            align: 'left'
        }, {
            title: '是否为叶子节点',
            dataIndex: 'leaf',
            align: 'center',
            scopedSlots: {customRender: 'leafSlot'}
        },
        {
            title: '操作',
            dataIndex: 'action',
            align: 'left',
            scopedSlots: {customRender: 'actionSlot'},

        }

    ];
    export default {
        name: "Authority",
        data() {
            return {
                spinning: false,
                userinfo:this.$store.state.userinfo,
                prefix: "/framework/admin/authority",
                data: null,
                columns,
                visible: false,
                form: {},
                treeData: [],
                pagination: {
                    pageSize: 10,
                    current: 1,
                    total: 0
                },
                keywords: '',
                add: {
                    show: () => {
                        this.form = {
                            leaf: false
                        };
                        this.modalTitle = "新增权限";
                        this.fillAuthorityTree();
                        this.visible = true;
                    }
                },
                edit: {
                    show: (record) => {
                        this.form = {...record};
                        this.modalTitle = "编辑权限";
                        this.fillAuthorityTree();
                        this.visible = true;
                    }
                },
                sysController: {
                    handleContollerReset(clearFilters, dataIndex) {
                        clearFilters();
                        this.query = this.query.filter(q => q.fieldName != dataIndex);
                        this.fetch()
                    },
                    handleSearch(selectedKeys, confirm, dataIndex) {
                        confirm();
                        const notIncluded = this.query.filter(q => q.fieldName != dataIndex);
                        let filter = {};
                        filter.fieldName = dataIndex;
                        filter.operator = 'LIKE';
                        filter.value = selectedKeys[0];
                        notIncluded.push(filter)
                        this.query = notIncluded;
                        this.fetch()
                    },
                    searchInput: null,
                    visible: false,
                    query: [],
                    columns: [
                        {
                            title: '控制点编码',
                            dataIndex: 'code'
                        },
                        {
                            title: '控制点路径',
                            dataIndex: 'codePath'
                        },
                        {
                            title: '控制点方法名',
                            dataIndex: 'codeMethodName',
                            scopedSlots: {
                                filterDropdown: 'filterDropdown',
                                filterIcon: 'filterIcon',
                            },
                        },
                        {
                            title: '控制点方法权限',
                            dataIndex: 'codeMethodAuth'
                        },
                    ],
                    data: [],
                    selected: {},
                    rowClick: (record) => {
                        return {
                            on: {
                                click: () => {
                                    this.sysController.selected = {...record};
                                    this.$set(this.form, "sysControllerId", record.id);
                                    this.$set(this.form, "code", record.code);
                                    this.sysController.visible = false;
                                }
                            }
                        };
                    },
                    showModal: () => {
                        this.sysController.fetch();
                        this.sysController.visible = true;
                    },
                    clear: () => {
                        this.$set(this.form, "code", null);
                        this.$set(this.form, "sysControllerId", null);
                        this.sysController.selected = null;
                    },
                    fetch: () => {
                        this.spinning = true;
                        const data = {
                            size: this.pagination.pageSize,
                            page: this.pagination.current,
                            example: {},
                            query: this.sysController.query
                        };
                        const that = this;
                        that.$http.post('/framework/admin/sysController/list', data).then(res => {
                            if (res.success) {
                                const data = res.data;
                                const pagination = {...that.pagination};
                                pagination.total = data.total;
                                that.loading = false;
                                that.sysController.data = data.result;
                                that.pagination = pagination;
                            }
                        }).catch(function (error) {
                            console.log(error);
                        })
                        that.spinning = false;
                    },
                    handleSubmit: (e) => {
                        e.preventDefault();
                        this.pagination.current = 1;
                        this.sysController.fetch();
                    },
                    //---重置---
                    handleReset: () => {
                        this.example = {};
                        this.pagination.current = 1;
                        this.sysController.query.forEach(q => {
                            q.value = null;
                        })
                        this.sysController.fetch();
                    },
                    //---换页---
                    handleTableChange: (pagination) => {
                        const pager = {...this.pagination};
                        pager.current = pagination.current;
                        this.pagination = pager;
                        this.sysController.fetch();
                    }
                },
                example: {},
                rules: {
                    title: [{required: true, message: '请输入名称', trigger: 'change'}],
                    code: [{required: true, message: '请输入编码', trigger: 'change'}],
                    leaf: [{required: true, message: '请选择是否叶子节点', trigger: 'change'}],
                    sysControllerId: [{required: true, message: '请选择控制点', trigger: 'change'}],
                    sort: [{required: true, message: '请输入显示顺序', trigger: 'change'}],
                },
                modalTitle: '新增权限',

                tenantList: []
            }
        },
        mounted() {
            this.fetch();
            this.$on('tenantChange', ()=>{
                this.fetch();
            })
        },
        methods: {
            createAuthorityList() {
                this.spinning = true
                this.$http.get('/framework/admin/authority/autoCreate').then(res=>{
                    if(res.success) {
                        this.$message.success('创建成功',2)
                        this.fetch()
                    }else {
                        this.$message.error(res.msg,2)
                    }
                    this.spinning = false
                })
            },
            handleReset() {
                this.pagination.current = 1;
                this.keywords = '';
                this.fetch();
            },
            onSearch(e) {
                e.preventDefault();
                if (!this.keywords) {
                    this.$message.warn("关键词不能为空！")
                    return
                }
                this.pagination.current = 1;
                this.search();
            },
            treeSelect(selectedKeys, info) {
                // console.log('selected', selectedKeys, info);
                console.log(selectedKeys)
                console.log(info)
            },
            drawerClose() {
                this.visible = false;
            },
            //---获取权限列表---
            fetch() {
                this.spinning = true;
                const that = this;
                const data = {
                    size: this.pagination.pageSize,
                    page: this.pagination.current,
                    example: this.example,
                };
                that.$http.post(that.prefix + '/treeList', data).then(res => {
                    if (res.success) {
                        that.data = res.data;
                    }
                }).catch(function (error) {
                    console.log(error);
                })
                that.spinning = false;
            },
            //---删除---
            delRecord(record) {
                const that = this;
                this.$confirm({
                    title: "警告",
                    content: "是否确认删除该条的数据项?",
                    onOk() {
                        that.handlerDelete(record.id);
                    }
                })
            },
            handlerDelete(recordId) {
                const that = this;
                that.spinning = true;
                let ids = [];
                ids.push(recordId)
                that.$http.post(that.prefix + '/delete', ids).then(res => {
                    if (res.success) {
                        that.$message.success(res.data);
                        that.fetch();
                    } else {
                        that.$message.error(res.msg);
                    }
                    that.spinning = false;
                }).catch(function (error) {
                    that.$message.error(error);
                    that.spinning = false;
                });
            },
            handleAddOk() {
                const that = this;
                that.$refs.ruleForm.validate(valid => {
                    if (valid) {
                        that.spinning = true
                        that.$http.post(that.prefix + "/saveOrUpdate", this.form).then(res => {
                            if (res.success) {
                                that.fetch();
                                that.$message.success('保存成功！');
                            }
                            that.spinning = false
                            that.visible = false
                        }).catch(err => {
                            console.log(err);
                            that.spinning = false
                        })
                    }
                })
            },
            fillAuthorityTree() {
                this.$http.get(this.prefix + '/dirTreeCombo').then(res => {
                    this.treeData = res.data;
                });
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
        min-height:625px;
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
