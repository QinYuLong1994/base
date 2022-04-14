<template>
    <a-spin :spinning="spinning">
        <div class="container">
            <a-form layout="inline" class="col-sm-12 search-collapse"
                    @submit="handleSubmit">
                <div class="top_handle_area">
                    <div class="row_item" style="justify-content: flex-start">
                        <div class="search_item" style="width: 30%;">
                            <a-form-item label="关键词：">
                                <a-input style="width: 300px;" v-model="keywords" placeholder="请输入名称或路由地址或组件路径"/>
                            </a-form-item>
                        </div>
                        <div class="search_item">
                            <a-button icon="search" type="primary" html-type="submit">搜索</a-button>
                            <a-button icon="redo" @click="handleReset">重置</a-button>
                        </div>
                    </div>
                </div>
            </a-form>
            <div class="bot_content_area">
                <div class="top_info">
                    <div class="info_title">文件菜单管理</div>
                    <div class="info_handle">
                        <a-button @click="autoCreate">自动创建文件菜单</a-button>
                    </div>
                </div>
                <div class="table_area">
                    <a-table :columns="columns"
                             :rowKey="record => record.id"
                             :dataSource="data"
                             :bordered="true"
                             :pagination="pagination"
                             :scroll="{ x: true }"
                             :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '暂无数据'}"
                             @change="handleTableChange"
                    >
                    <span slot="actionSlot" slot-scope="text,record">
                       <a-button type="link" @click="showEdit(record)" style="margin-right: 15px">配置</a-button>
                    </span>
                    </a-table>
                </div>
            </div>
        </div>
        <a-modal title="选择控制点" v-model="sysControllerVisible" @ok="chooseConfirm" @cancel="chooseCancel" okText="确定"
                 width="70%"
                 :cancel-button-props="cancelButton">
            <a-radio-group :default-value="filterType" button-style="solid" @change="filterTypeChange"
                           style="margin-bottom:10px">
                <a-radio-button value="all">
                    全部
                </a-radio-button>
                <a-radio-button value="selected">
                    已选择的
                </a-radio-button>
            </a-radio-group>
            <div class="select-table col-sm-12">
                <a-table :columns="sysControllerColumns"
                         :rowKey="record => record.id"
                         :dataSource="sysControllers"
                         :defaultExpandAllRows="true"
                         :bordered="true"
                         :pagination="controllerPagination"
                         :scroll="{ x: true }"
                         :rowSelection="{selectedRowKeys:selectedRowKeys,onSelect:onSelect}"
                         :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '暂无数据'}"
                         @change="handleControllerTableChange"
                >
                    <div
                            slot="filterDropdown"
                            slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
                            style="padding: 8px"
                    >
                        <a-input
                                v-ant-ref="c => (searchInput = c)"
                                :placeholder="`Search ${column.title}`"
                                :value="selectedKeys[0]"
                                style="width: 188px; margin-bottom: 8px; display: block;"
                                @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                                @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
                        />
                        <a-button
                                type="primary"
                                icon="search"
                                size="small"
                                style="width: 90px; margin-right: 8px"
                                @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
                        >
                            搜索
                        </a-button>
                        <a-button size="small" style="width: 90px"
                                  @click="() => handleContollerReset(clearFilters,column.dataIndex)">
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
        <a-drawer title="编辑文件菜单"
                  :width="1000"
                  :visible="visible"
                  class="drawer"
                  @close="drawerClose"
        >
            <a-form-model ref="ruleForm" :rules="rules" :model="form">
                <a-form-model-item label="菜单名称" prop="name" class="halfBox">
                    <a-input v-model="form.name" class="inputStyle" placeholder="请输入菜单名称"/>
                </a-form-model-item>
                <a-form-model-item label='路由地址' prop="path" class="halfBox">
                    <a-input type="text" v-model="form.path" class="inputStyle" :disabled="true" placeholder="请输入路由地址"/>
                </a-form-model-item>
                <a-form-model-item label='组件路径' prop="component" class="halfBox">
                    <a-input type="text" v-model="form.component" class="inputStyle" :disabled="true"
                             placeholder="请输入组件路径"/>
                </a-form-model-item>
                <a-form-model-item>
                    <a-button type="primary" @click="showSysControllerModal(form.id)">选择控制点</a-button>
                </a-form-model-item>
                <a-form-model-item label="已选择的控制点">
                    <div class="select-table col-sm-12">
                        <a-table :columns="selectedSysControllerColumns"
                                 :rowKey="record => record.id"
                                 :dataSource="selectedControllers"
                                 :bordered="true"
                                 :pagination="false"
                                 @change="handleControllerTableChange"
                                 :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '暂无数据'}"
                        >
                        </a-table>
                    </div>
                </a-form-model-item>
            </a-form-model>
            <div class="handle_area">
                <a-button style="margin-right: 30px" @click="drawerClose">取消</a-button>
                <a-button type="primary" @click="handleAddOk">保存</a-button>
            </div>
        </a-drawer>
    </a-spin>
</template>

<script>
    const columns = [
        {
            title: '菜单名称',
            dataIndex: 'name',
            align: 'left'
        }, {
            title: '路由地址',
            dataIndex: 'path',
            align: 'left'
        }, {
            title: '组件路径',
            dataIndex: 'component',
            align: 'left'
        }, {
            title: '操作',
            dataIndex: 'action',
            align: 'left',
            scopedSlots: {customRender: 'actionSlot'}
        }
    ];
    const sysControllerColumns = [
        {
            title: '控制点编码',
            dataIndex: 'code'
        },
        {
            title: '控制点路径',
            dataIndex: 'codePath'
        },
        {
            title: '控制点方法',
            dataIndex: 'codeMethodName',
            scopedSlots: {
                filterDropdown: 'filterDropdown',
                filterIcon: 'filterIcon',
            },
        },
        {
            title: '控制点名称',
            dataIndex: 'name'
        },
    ];
    const selectedSysControllerColumns = [
        {
            title: '控制点路径',
            dataIndex: 'codePath'
        },
        {
            title: '控制点名称',
            dataIndex: 'name'
        },
        {
            title: '控制点方法权限',
            dataIndex: 'codeMethodAuth'
        },
    ];
    export default {
        name: "SysMenu",
        data() {
            return {
                controllerQuery: [],
                query: [],
                keywords: '',
                cancelButton: {style: {display: 'none'}},
                selectedSysControllerColumns,
                sysControllerColumns,
                spinning: false,
                prefix: "/framework/admin/sysMenu",
                data: [],
                columns,
                visible: false,
                form: {},
                labelCol: {span: 5},
                wrapperCol: {span: 18},
                treeData: [],
                pagination: {
                    pageSize: 10,
                    page: 1,
                    total: 0
                },
                controllerPagination: {
                    pageSize: 10,
                    page: 1,
                    total: 0
                },
                rules: {
                    name: [{required: true, message: '请输入路由名称', trigger: 'change'}],
                    path: [{required: true, message: '请输入路由地址', trigger: 'change'}],
                    component: [{required: true, message: '请输入组件路径', trigger: 'change'}],
                },
                sysControllers: [],
                sysControllerVisible: false,
                selectedRowKeys: [],
                selectedControllers: [],
                filterType: "all",
                searchInput: null,
                // 只有编辑的时候，控制点取并集
                flag: false,
            }
        },
        mounted() {
            this.fetch();
        },
        methods: {
            handleContollerReset(clearFilters, dataIndex) {
                clearFilters();
                this.controllerQuery = this.controllerQuery.filter(q => q.fieldName != dataIndex);
                this.fetchSysController(this.form.id)
            },
            handleSearch(selectedKeys, confirm, dataIndex) {
                confirm();
                const notIncluded = this.controllerQuery.filter(q => q.fieldName != dataIndex);
                let filter = {};
                filter.fieldName = dataIndex;
                filter.operator = 'LIKE';
                filter.value = selectedKeys[0];
                notIncluded.push(filter)
                this.controllerQuery = notIncluded;
                this.fetchSysController(this.form.id)
            },
            onSelect(record, selected) {
                if (selected) {
                    this.selectedRowKeys.push(record.id);
                    this.selectedControllers.push(record);
                } else {
                    this.selectedRowKeys.splice(this.selectedRowKeys.indexOf(record.id), 1)
                    this.selectedControllers.splice(this.selectedControllers.indexOf(record), 1)
                }
            },
            chooseConfirm() {
                this.sysControllerVisible = false;
            },
            chooseCancel() {
                this.sysControllerVisible = false;
            },
            drawerClose() {
                this.visible = false;
                this.selectedControllers = []
            },
            //---获取路由信息列表---
            fetch() {
                const that = this;
                that.spinning = true;
                const data = {
                    size: that.pagination.pageSize,
                    page: that.pagination.page,
                    example: {},
                    query: that.query
                };
                that.$http.post(that.prefix + '/list', data).then(res => {
                    if (res.success) {
                        const data = res.data;
                        const pagination = {...that.pagination};
                        pagination.total = data.total;
                        that.spinning = false;
                        that.data = data.result;
                        that.pagination = pagination;
                    }
                }).catch(error=>{
                    if(error) {
                        that.$message.error('系统错误',2)
                        that.spinning = false;
                    }
                })
            },
            autoCreate() {
                this.spinning = true;
                const that = this;
                this.$http.get(that.prefix + '/autoCreate').then(res => {
                    if (res.success) {
                        that.$message.info(res.data);
                        this.fetch();
                    } else {
                        that.$message.error(res.msg);
                    }
                }).catch(function (error) {
                    console.log(error);
                })
                that.spinning = false;
            },
            async showEdit(record) {
                this.selectedRowKeys = [];
                this.form = {...record};
                this.flag = true
                await this.fetchSysController(record.id, null);
                this.flag = false
                this.modalTitle = "编辑菜单文件";
                this.visible = true;
            },
            showSysControllerModal() {
                this.sysControllerVisible = true;
            },
            filterSelected() {
                this.filterType = 'selected';
                this.fetchSysController(this.form.id)
            },
            filterNotSelected() {
                this.$message.warn("serviceImpl中暂无NOT IN")
            },
            filterTypeChange(e) {
                this.filterType = e.target.value;
                this.fetchSysController(this.form.id)
            },
            async fetchSysController(sysMenuId) {
                this.spinning = true;
                let query = this.controllerQuery.filter(q => q.fieldName != 'id');
                let filter = {};
                filter.fieldName = 'id';
                if (this.filterType == 'selected') {
                    filter.operator = "IN";
                    filter.value = this.selectedRowKeys.toString();
                    if (filter.value == '') filter.value = 'none';
                } else if (this.filterType == 'notSelected') {
                    filter.operator = "NIN";
                    filter.value = this.selectedRowKeys.toString();
                    if (filter.value == '') filter.value = 'none';
                } else {
                    filter.value = null;
                }
                query.push(filter);
                this.controllerQuery = query;
                // console.log(this.controllerQuery)
                const data = {
                    size: this.controllerPagination.pageSize,
                    page: this.controllerPagination.page,
                    example: {},
                    query: query
                };
                const that = this;
                // console.log(data)
                try{
                  let res = await that.$http.post('/framework/admin/sysController/list/select?mid=' + sysMenuId, data)
                if (res.success) {
                    const data = res.data;
                    const pagination = {...that.controllerPagination};
                    pagination.total = data.total;
                    that.spinning = false;
                    that.sysControllers = data.result;
                    const fetchedControllers = data.controllers;
                    if(that.flag){
                      fetchedControllers.forEach(controller => {
                        const filtered = that.selectedControllers.filter(c => c.id == controller.id);
                        if (filtered.length == 0) that.selectedControllers.push(controller);
                      })
                      that.selectedControllers.forEach(controller => {
                          const controllerId = controller.id;
                          const filterIds = that.selectedRowKeys.filter(r => r == controllerId)
                          if (filterIds.length == 0) that.selectedRowKeys.push(controllerId);
                      })
                    }
                    
                    that.controllerPagination = pagination;
                }
                }catch(err){
                  this.spinning = false
                }
                
                

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
                        this.form.selectedRowKeys = this.selectedRowKeys;
                        that.spinning = true
                        that.$http.post(that.prefix + "/update", this.form).then(res => {
                            if (res.success) {
                                that.selectedRowKeys = [];
                                that.fetch();
                                that.$message.success('保存成功！');
                            }
                            that.spinning = false
                            that.visible = false
                            that.sysControllers = []
                        }).catch(() => {
                            that.$message.error('系统错误',2)
                            that.spinning = false
                        })
                    }
                })
            },
            //---搜索---
            handleSubmit(e) {
                e.preventDefault();
                if (!this.keywords) {
                    this.$message.warn("关键词不能为空！")
                    return
                }
                this.query = [
                    {
                        fieldName: 'name',
                        value: this.keywords,
                        operator: 'LIKE'
                    },
                    {
                        fieldName: 'component',
                        value: this.keywords,
                        operator: 'LIKE'
                    },
                    {
                        fieldName: 'path',
                        value: this.keywords,
                        operator: 'LIKE'
                    },
                ];
                this.pagination.page = 1;
                this.fetch();
            },
            //---重置---
            handleReset() {
                this.keywords = '';
                this.query = [];
                this.pagination.page = 1;
                this.fetch();
            },
            //---换页---
            handleTableChange(pagination) {
                const pager = {...this.pagination};
                pager.page = pagination.current;
                this.pagination = pager;
                this.fetch();
            },
            //---换页---
            handleControllerTableChange(controllerPagination) {
                const pager = {...this.controllerPagination};
                pager.page = controllerPagination.current;
                this.controllerPagination = pager;
                this.fetchSysController(this.form.id);
            },
            searchController(e) {
                e.preventDefault();
                this.fetchSysController(this.form.id);
            },
            //---重置---
            handleControllerReset() {
                this.filterType = null;
                this.controllerQuery.forEach(query => {
                    query.value = undefined;
                });
                this.fetchSysController();
            },

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

    .container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .top_handle_area {
            width: 100%;
            /*min-height:64px;*/
            background: #ffffff;
            display: flex;
            flex-direction: column;
            padding: 15px;
            .row_item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                &:nth-child(2) {
                    margin-top: 20px;
                }
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
                        margin-right: 20px;
                    }
                    .submit_area {
                        font-size: 16px;
                        color: #347DF7;
                        cursor: pointer;
                        min-width: 80px;
                    }
                }
            }
        }
        .bot_content_area {
            width: 100%;
            flex: 1;
            margin-top: 16px;
            background: #ffffff;
            /*min-height: 625px;*/
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
                .ant-btn[disabled] {
                    color: rgba(0, 0, 0, 0.25) !important;
                    border-color: #d9d9d9 !important;
                }
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
