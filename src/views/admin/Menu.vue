<template>
    <a-spin :spinning="spinning">
        <div class="container">
            <div class="bot_content_area" style="margin-top: 0">
                <div class="top_info">
                    <div class="info_title">菜单管理</div>
                    <div class="info_handle">
                        <a-button @click="showAdd">增加</a-button>
                    </div>
                </div>
                <div class="table_area">
                    <a-table :columns="columns"
                             v-if="data != null"
                             :rowKey="record => record.id"
                             :dataSource="data"
                             :defaultExpandAllRows="true"
                             :bordered="true"
                             class="contentCat-list"
                             :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '暂无数据'}"
                    >
                <span slot="leafSlot" slot-scope="text">
                    <span v-if="text">是</span>
                    <span v-if="!text">否</span>
                </span>
                        <span slot="hiddenSlot" slot-scope="text">
                    <span v-if="text">是</span>
                    <span v-if="!text">否</span>
                </span>
                        <span slot="actionSlot" slot-scope="text,record">
                    <a-button type="link" @click="showEdit(record)" style="margin-right: 15px">编辑</a-button>
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
                <a-form-model-item label="上级菜单:" prop="parentId">
                    <a-tree-select
                            v-model="form.parentId"
                            style="width: 100%"
                            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                            :treeData="treeData"
                            placeholder="请选择上级菜单"
                            allow-clear
                            tree-default-expand-all>
                    </a-tree-select>
                </a-form-model-item>
                <a-form-model-item label="菜单名称" prop="title" class="halfBox">
                    <a-input v-model="form.title" class="inputStyle" placeholder="请输入菜单名称"/>
                </a-form-model-item>
                <a-form-model-item label="显示状态" prop="hidden" class="halfBox">
                    <a-radio-group v-model="form.hidden" class="inputStyle">
                        <a-radio :value="false" :key="false">显示</a-radio>
                        <a-radio :value="true" :key="true">隐藏</a-radio>
                    </a-radio-group>
                </a-form-model-item>
                <a-form-model-item label='菜单图标' prop="icon" class="halfBox">
                    <a-input type="text" v-model="form.icon" class="inputStyle" placeholder="请输入菜单图标"/>
                </a-form-model-item>
                <a-form-model-item label='显示顺序' prop="sort" class="halfBox">
                    <a-input-number v-model="form.sort" class="inputStyle" :min="1" style="width:100%" :precision="0"
                                    placeholder="请输入显示顺序"></a-input-number>
                </a-form-model-item>
                <a-form-model-item label="是否叶子节点" prop="leaf" class="halfBox">
                    <a-radio-group @change="handleLeafChange" v-model="form.leaf" class="inputStyle">
                        <a-radio :value="false" :key="false">否</a-radio>
                        <a-radio :value="true" :key="true">是</a-radio>
                    </a-radio-group>
                </a-form-model-item>
                <a-divider  v-if="form.leaf"/>
                <a-form-model-item v-if="form.leaf">
                    <a-button type="primary" @click="showSysMenuModal">选择文件菜单</a-button>
                    <a-button @click="clearSysMenu" style="margin: 0px 10px">清空文件菜单</a-button>
                </a-form-model-item>
                <a-form-model-item label='路由地址' prop="path" class="halfBox" v-if="form.leaf">
                    <a-input type="text" v-model="form.path" class="inputStyle" :disabled="true" placeholder="请输入路由地址"/>
                </a-form-model-item>
                <a-form-model-item label='组件路径' prop="component" class="halfBox" v-if="form.leaf">
                    <a-input type="text" v-model="form.component" class="inputStyle" :disabled="true"
                             placeholder="请输入组件路径"/>
                </a-form-model-item>
                <a-divider v-if="form.leaf" />
            </a-form-model>

            <div class="handle_area">
                <a-button @click="drawerClose" style="margin-right: 30px">取消</a-button>
                <a-button type="primary" @click="handleAddOk">保存</a-button>
            </div>

        </a-drawer>

        <a-modal title="选择文件菜单" v-model="sysMenuVisible" okText="保存" cancelText="取消" width="50%">
            <div class="select-table col-sm-12">
                <a-table :columns="sysMenuColumns"
                         :rowKey="record => record.id"
                         :dataSource="sysMenus"
                         :defaultExpandAllRows="true"
                         :bordered="true"
                         :customRow="sysMenuRowClick"
                         :pagination="pagination"
                         :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '暂无数据'}"
                         @change="handleTableChange"
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

    </a-spin>
</template>

<script>
    const columns = [
        {
            title: '菜单名称',
            dataIndex: 'title',
            align: 'left'
        }, {
            title: '路由地址',
            dataIndex: 'sysMenu.path',
            align: 'left'
        }, {
            title: '组件路径',
            dataIndex: 'sysMenu.component',
            align: 'left'
        }, {
            title: 'menuKey',
            dataIndex: 'menuKey',
            align: 'center'
        }, {
            title: '菜单图标',
            dataIndex: 'icon',
            align: 'center'
        }, {
            title: '是否为叶子节点',
            dataIndex: 'leaf',
            align: 'left',
            scopedSlots: {customRender: 'leafSlot'}
        }, {
            title: '是否隐藏',
            dataIndex: 'hidden',
            align: 'left',
            scopedSlots: {customRender: 'hiddenSlot'}
        }, {
            title: '排序',
            dataIndex: 'sort',
            align: 'left',
        }, {
            title: '操作',
            dataIndex: 'action',
            align: 'left',
            scopedSlots: {customRender: 'actionSlot'}
        }

    ];
    const sysMenuColumns = [
        {
            title: '菜单名称',
            dataIndex: 'name',
            align: 'left',
            scopedSlots: {
                filterDropdown: 'filterDropdown',
                filterIcon: 'filterIcon',
            },
        }, {
            title: '路由地址',
            dataIndex: 'path',
            align: 'left',
            scopedSlots: {
                filterDropdown: 'filterDropdown',
                filterIcon: 'filterIcon',
            },
        }, {
            title: '组件路径',
            dataIndex: 'component',
            align: 'left',
            scopedSlots: {
                filterDropdown: 'filterDropdown',
                filterIcon: 'filterIcon',
            },
        }
    ];
    export default {
        name: "Menu",
        data() {
            return {
                searchInput: null,
                sysMenuQuery: [],
                sysMenuVisible: false,
                spinning: false,
                prefix: "/framework/admin/menu",
                data: null,
                columns,
                sysMenuColumns,
                visible: false,
                form: {},
                labelCol: {span: 5},
                wrapperCol: {span: 18},
                treeData: [],
                pagination: {
                    pageSize: 10,
                    current: 1,
                    total: 0
                },
                example: {},
                rules: {
                    title: [{required: true, message: '请输入菜单名称', trigger: 'blur'}],
                    path: [{required: true, message: '请输入路由地址'}],
                    component: [{required: true, message: '请输入组件路径'}],
                    leaf: [{required: true, message: '请选择是否叶子节点'}],
                    hidden: [{required: true, message: '请选择是否可见'}],
                    menuKey: [{required: true, message: '请输入菜单key'}],
                    sort: [{required: true, message: '请输入显示顺序', trigger: 'blur'}],
                },
                modalTitle: '新增菜单',
                sysMenus: [],
                selectedSysMenu: null,

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
          handleLeafChange(e){
            if(e.target.value){
              return;
            }
            this.clearSysMenu()
          },
            handleContollerReset(clearFilters, dataIndex) {
                clearFilters();
                this.sysMenuQuery = this.sysMenuQuery.filter(q => q.fieldName != dataIndex);
                this.fetchSysMenus();
            },
            handleSearch(selectedKeys, confirm, dataIndex) {
                confirm();
                const notIncluded = this.sysMenuQuery.filter(q => q.fieldName != dataIndex);
                let filter = {};
                filter.fieldName = dataIndex;
                filter.operator = 'LIKE';
                filter.value = selectedKeys[0];
                notIncluded.push(filter)
                this.sysMenuQuery = notIncluded;
                this.fetchSysMenus();
            },
            drawerClose() {
                this.visible = false;
            },
            sysMenuRowClick(record) {
                return {
                    on: {
                        click: () => {
                            this.selectedSysMenu = {...record};
                            if (!this.form.title) {
                                this.$set(this.form, "title", record.name);
                            }
                            this.$set(this.form, "path", record.path);
                            this.$set(this.form, "component", record.component);
                            this.$set(this.form, "sysMenuId", record.id);
                            this.sysMenuVisible = false;
                        }
                    }
                };
            },
            //---获取菜单信息列表---
            fetch() {
                this.spinning = true;
                const that = this;
                const data = {
                    size: this.pagination.pageSize,
                    page: this.pagination.current,
                    example: this.example,
                };
                this.$http.post(that.prefix + '/treeList', data).then(res => {
                    that.spinning = false;
                    if (res.success) {
                        this.data = res.data;
                    }
                }).catch(function (error) {
                    console.log(error);
                })
            },
            showSysMenuModal() {
                this.fetchSysMenus();
                this.sysMenuVisible = true;
            },
            clearSysMenu() {
                // this.form  = JSON.parse(JSON.stringify(this.form));
                // this.$set(this.form, "title", null);
                this.$set(this.form, "path", null);
                this.$set(this.form, "component", null);
                this.$set(this.form, "sysMenuId", null);
                this.selectedSysMenu = null;
            },
            fetchSysMenus() {
                this.spinning = true;
                const data = {
                    size: this.pagination.pageSize,
                    page: this.pagination.current,
                    example: {},
                    query: this.sysMenuQuery
                };
                const that = this;
                that.$http.post('/framework/admin/sysMenu/list', data).then(res => {
                    if (res.success) {
                        const data = res.data;
                        const pagination = {...that.pagination};
                        pagination.total = data.total;
                        that.loading = false;
                        that.sysMenus = data.result;
                        that.pagination = pagination;
                    }
                }).catch(function (error) {
                    console.log(error);
                })
                that.spinning = false;
            },
            showAdd() {
                this.form = {
                    hidden: false,
                    leaf: false
                };
                this.modalTitle = "新增菜单";
                this.fillMenuTree();
                this.visible = true;

            },
            showEdit(record) {
                this.form = {...record};
                const sysMenu = record.sysMenu;
                if (sysMenu) {
                    this.$set(this.form, "path", sysMenu.path)
                    this.$set(this.form, "component", sysMenu.component)
                }
                this.modalTitle = "编辑菜单";
                this.fillMenuTree();
                this.visible = true;
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
                    console.log(res)
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
            fillMenuTree() {
                this.$http.get(this.prefix + '/dirTreeCombo').then(res => {
                    this.treeData = res.data;
                });
            },
            //---搜索---
            handleSubmit(e) {
                e.preventDefault();
                this.pagination.current = 1;
                this.fetchSysMenus();
            },
            //---重置---
            handleReset() {
                this.example = {};
                this.pagination.current = 1;
                this.sysMenuQuery.forEach(query => {
                    query.value = null;
                })
                this.fetchSysMenus();
            },
            //---换页---
            handleTableChange(pagination) {
                const pager = {...this.pagination};
                pager.current = pagination.current;
                this.pagination = pager;
                this.fetchSysMenus();
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
