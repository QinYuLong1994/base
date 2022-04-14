<template>
    <a-spin :spinning="spinning">
        <div class="container">
            <div class="bot_content_area">
                <div class="top_info">
                    <div class="info_title">数据约束</div>
                    <div class="info_handle">
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
                <a-form-model-item label="数据约束名称" prop="title" class="halfBox">
                    <a-input v-model="form.title" class="inputStyle" placeholder="请输入数据约束名称"/>
                </a-form-model-item>
                <a-form-model-item label='配置权重' prop="sort" class="halfBox">
                    <a-input-number v-model="form.sort" class="inputStyle" :min="1" style="width:100%" :precision="0"
                                    placeholder="请输入权重"></a-input-number>
                </a-form-model-item>
                <a-form-model-item label="是否叶子节点" prop="leaf" class="halfBox">
                    <a-radio-group v-model="form.leaf" class="inputStyle">
                        <a-radio :value="false" :key="false">否</a-radio>
                        <a-radio :value="true" :key="true">是</a-radio>
                    </a-radio-group>
                </a-form-model-item>
                <div v-if="form.leaf">
                    <a-divider  />
                    <a-form-model-item label='数据表' prop="tableName">
                        <a-select placeholder="选择表"  :allowClear="true" v-model="form.tableName" @change="chooseTable">
                            <a-select-option v-for="table in tableList" :key="table">{{ table}}</a-select-option>
                        </a-select>
                    </a-form-model-item>
                    <a-form-model-item label='数据列' prop="columnName">
                        <a-select placeholder="选择列"  :allowClear="true" v-model="form.columnName">
                            <a-select-option v-for="column in columnList" :key="column">{{ column }}</a-select-option>
                        </a-select>
                    </a-form-model-item>
                    <a-form-model-item label='数据列值' prop="columnValue">
                        <a-input type="text" placeholder="请输入列值" v-model="form.columnValue">
                        </a-input>
                    </a-form-model-item>
                    <a-form-model-item label='约束' prop="operator">
                        <a-input type="text" placeholder="请输入约束，例如：'>','<', '=', 'like'" v-model="form.operator">
                        </a-input>
                    </a-form-model-item>
                </div>
            </a-form-model>

            <div class="handle_area">
                <a-button @click="drawerClose" style="margin-right: 30px">取消</a-button>
                <a-button type="primary" @click="handleAddOk">保存</a-button>
            </div>

        </a-drawer>

    </a-spin>
</template>

<script>
    const columns = [
        {
            title: '名称',
            dataIndex: 'title',
            align: 'left'
        },
        {
            title: '表名',
            dataIndex: 'tableName',
        },
        {
            title: '列名',
            dataIndex: 'columnName',
        },
        {
            title: '列值',
            dataIndex: 'columnValue',
        },
        {
            title: '约束',
            dataIndex: 'operator',
        },
        {
            title: '是否为叶子节点',
            dataIndex: 'leaf',
            width: 200,
            scopedSlots: {customRender: 'leafSlot'}
        },
        {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: {customRender: 'actionSlot'},
        }

    ];
    export default {
        name: "Data",
        data() {
            return {
                spinning: false,
                prefix: "/framework/admin/data",
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
                        this.modalTitle = "新增约束";
                        this.fillDataTree();
                        this.fetchTableList();
                        this.visible = true;
                    }
                },
                edit: {
                    show: (record) => {
                        this.form = {...record};
                        this.modalTitle = "编辑权限";
                        this.fillDataTree();
                        this.fetchTableList();
                        this.visible = true;
                    }
                },
                example: {},
                rules:{
                    title: [{required: true, message: '请输入名称', trigger: 'change'}],
                    leaf: [{required: true, message: '请选择是否叶子节点', trigger: 'change'}],
                    sort: [{required: true, message: '请输入顺序', trigger: 'change'}],
                    tableName: [{required: true, message: '请选择表名', trigger: 'change'}],
                    columnName: [{required: true, message: '请选择列名', trigger: 'change'}],
                    columnValue: [{required: true, message: '请输入列的值', trigger: 'change'}],
                    operator: [{required: true, message: '请输入约束', trigger: 'change'}]
                },
                modalTitle: '新增约束',

                tableList:[],
                columnList: [],
            }
        },
        mounted() {
            this.fetch();
            this.$on('tenantChange', ()=>{
                this.fetch();
            })
        },
        methods: {
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
            fillDataTree() {
                this.$http.get(this.prefix + '/dirTreeCombo').then(res => {
                    this.treeData = res.data;
                });
            },

            fetchTableList(){
                this.$http.get(this.prefix +'/table').then(res =>{
                    if (res.success){
                        this.tableList = res.data;
                    }else {
                        this.$message.error(res.msg, 2);
                    }
                })
            },
            fetchColumnList(table) {
                this.$http.get(this.prefix +'/column?table='+table).then(res =>{
                    if (res.success){
                        this.columnList = res.data;
                    }else {
                        this.$message.error(res.msg, 2);
                    }
                })
            },
            chooseTable(value){
                if (value){
                    this.fetchColumnList(value)
                }
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
