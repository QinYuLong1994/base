<template>
    <div class="container">
        <div class="top_handle_area">
            <div class="row_item" style="justify-content: flex-start">
                <div class="search_item">
                    <div class="search_label">租户名称</div>
                    <a-input allowClear v-model="searchName" placeholder="请输入租户名称"
                             class="search_area"></a-input>
                </div>
                <div class="search_item">
                    <div class="search_label">租户域名</div>
                    <a-input class="search_area" allowClear v-model="searchHost" placeholder="请输入子域名"
                             c></a-input>
                </div>
                <div class="search_item">
                    <a-button type="primary" @click="onSearch">查询</a-button>
                    <a-button @click="resetSearch">重置</a-button>
                </div>
            </div>
        </div>
        <div class="bot_content_area">
            <div class="top_info">
                <div class="info_title">租户管理</div>
                <div class="info_handle">
                    <a-button @click="addTenant.show">增加</a-button>
                    <a-popconfirm placement="right" okText="确定" cancelText="取消" @confirm="handleDelete">
                        <template slot="title">
                            <p>是否删除选中的行</p>
                            <p>{{ selectRows }}</p>
                        </template>
                        <a-button>删除</a-button>
                    </a-popconfirm>
                </div>
            </div>
            <div class="table_area">
                <a-table :columns="columns"
                         :rowKey="record => record.id"
                         :dataSource="data"
                         :pagination="pagination"
                         :loading="loading"
                         :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
                         :bordered="true"
                         class="contentCat-list"
                         @change="handleTableChange"
                         :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '暂无数据'}"
                         :scroll="{ x: true }"
                >
            <span slot="action" slot-scope="record">
                <a-button type="link" style="margin-right: 5px" @click="editTenant.show(record)">编辑</a-button>
                <a-button type="link" style="margin-right: 5px" @click="addAuth.show(record)">授权</a-button>
                <a-button type="link" style="margin-right: 5px" @click="addAuth.syncDb(record)" v-if="addAuth.mode === 'SCHEMA'">同步</a-button>
            </span>
                </a-table>
            </div>


        </div>


        <a-modal :title="isAdd?'增加租户':'更新租户'"
                 v-model="modalVisible"
                 okText="保存"
                 cancelText="取消"
                 @ok="handleSubmit"
                 @cancel="handleCancel"
        >
            <a-form-model :model="tenantForm" :rules="tenantRules" ref="tenantForm" :labelCol="{ span: 4 }"
                          :wrapperCol="{ span: 19, offset: 1 }">
                <template v-if="isAdd">
                    <a-form-model-item prop="username" label="用户名">
                        <a-input type="text" v-model="tenantForm.username" placeholder="登陆的用户名"></a-input>
                    </a-form-model-item>
                    <a-form-model-item prop="password" label='密码'>
                        <a-input type="password" v-model="tenantForm.password" placeholder="输入密码"></a-input>
                    </a-form-model-item>
                    <a-divider></a-divider>
                </template>
                <a-form-model-item prop="name" label='名称'>
                    <a-input type="text" v-model="tenantForm.name" placeholder="租户名称"></a-input>
                </a-form-model-item>
                <a-form-model-item prop="phone" label="电话">
                    <a-input type="text" v-model="tenantForm.phone" placeholder="联系电话"></a-input>
                </a-form-model-item>
                <a-form-model-item prop="" label="省">
                    <a-input type="text" v-model="tenantForm.province" placeholder="省"></a-input>
                </a-form-model-item>
                <a-form-model-item prop="" label="市">
                    <a-input type="text" v-model="tenantForm.city" placeholder="市"></a-input>
                </a-form-model-item>
                <a-form-model-item prop="" label="区">
                    <a-input type="text" v-model="tenantForm.area" placeholder="区"></a-input>
                </a-form-model-item>
                <a-form-model-item prop="host" label="租户域名">
                    <a-input type="text" v-model="tenantForm.host" placeholder="二级域名"></a-input>
                </a-form-model-item>
                <a-divider></a-divider>
                <a-form-item prop="expired" label="过期时间">
                    <a-date-picker v-model="tenantForm.expired"/>
                </a-form-item>
            </a-form-model>

        </a-modal>

        <a-drawer title="授权"
                  :visible="addAuth.visible"
                  @close="addAuth.cancelAdd"
                  :width="700"
                  class="add_drawer"
        >
            <div class="form_item">
                <div class="item_label">菜单管理：</div>
                <a-tree
                        v-model="addAuth.menu.checkedKeys"
                        checkable
                        :selectable="false"
                        :show-line="true"
                        :expanded-keys="addAuth.menu.expandedKeys"
                        :autoExpandParent="addAuth.menu.autoExpandParent"
                        :checked-keys="addAuth.menu.checkedKeys"
                        :tree-data="addAuth.menu.treeData"
                        @expand="addAuth.onMenuExpand"
                        @check="addAuth.onMenuChecked"
                />
            </div>
            <a-divider/>
            <div class="form_item">
                <div class="item_label">权限管理：</div>
                <a-tree
                        v-model="addAuth.auth.checkedKeys"
                        checkable
                        :selectable="false"
                        :show-line="true"
                        :expanded-keys="addAuth.auth.expandedKeys"
                        :autoExpandParent="addAuth.auth.autoExpandParent"
                        :checked-keys="addAuth.auth.checkedKeys"
                        :tree-data="addAuth.auth.treeData"
                        @expand="addAuth.onAuthExpand"
                        @check="addAuth.onAuthChecked"
                />
            </div>
            <div class="handle_area">
                <a-button style="margin-right: 30px" @click="addAuth.cancelAdd">取消</a-button>
                <a-button type="primary" @click="addAuth.handleAddOk">保存</a-button>
            </div>

        </a-drawer>


    </div>
</template>

<script>

    import moment from 'moment'

    const columns = [
        {
            title: '名称',
            dataIndex: 'name'
        },
        {
            title: '电话',
            dataIndex: 'phone'
        },
        {
            title: '过期时间',
            dataIndex: 'expired'
        },
        {
            title: '租户域名',
            dataIndex: 'host'
        },
        {
            title: '创建时间',
            dataIndex: 'created'
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'},
        }
    ];

    export default {
        mounted() {
            this.fetch();
        },
        data() {
            return {
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
                query: [],
                searchName: null,
                searchHost: null,

                // 租户功能相关
                isAdd: true,
                modalVisible: false,
                tenantForm: {},
                tenantRules: {
                    username: [{required: true, message: '请输入用户名'}, {max: 20, message: '输入长度不超过20'}],
                    password: [{required: true, message: '请输入密码'}],
                    name: [{required: true, message: '请输入名称'}, {max: 20, message: '输入长度不超过20'}],
                    phone: [{required: true, message: '请输入手机号'}, {validator: this.validateToPhone, trigger: 'blur'}],
                    host: [{required: true, message: '请输入二级域名'}, {max: 10, message: '输入长度不超过10'}],
                    expired: [{required: true, message: '请选择过期时间'}]
                },
                // 新增
                addTenant: {
                    show: () => {
                        this.isAdd = true
                        this.modalVisible = true;
                        this.tenantForm = {}
                    },
                },
                // 编辑
                editTenant: {
                    visible: false,
                    form: {},
                    show: (record) => {
                        this.isAdd = false
                        this.tenantForm = {
                            ...record,
                            expired: moment(record.expired)
                        }
                        this.modalVisible = true
                    },
                },


                // 授权
                addAuth: {
                    visible: false,
                    mode: this.$store.state.tenantMode,
                    env: this.$store.state.tenantEnv,
                    role: {},
                    tenant: {},
                    menu: {
                        expandedKeys: [],
                        autoExpandParent: true,
                        checkedKeys: [],
                        saveKeys: [],
                        treeData: [],
                    },
                    auth: {
                        expandedKeys: [],
                        autoExpandParent: true,
                        checkedKeys: [],
                        saveKeys: [],
                        treeData: [],
                    },
                    show: (record) => {
                        // console.log(record)
                        if (this.addAuth.mode === 'SCHEMA'){
                            this.$store.state.tenantHost = record.host
                        }
                        this.$http.get('/framework/admin/sysTenant/config?tenantId=' + record.id).then(res => {
                            if (this.addAuth.mode === 'SCHEMA'){
                                this.$store.state.tenantHost = ''
                            }
                            if (res.success) {
                                this.addAuth.role = res.data.role
                                this.addAuth.tenant = res.data.tenant

                                this.addAuth.auth.treeData = res.data.auth.combo
                                this.addAuth.auth.checkedKeys = res.data.auth.select
                                this.addAuth.auth.saveKeys = res.data.auth.authorityIds

                                this.addAuth.menu.treeData = res.data.menu.combo
                                this.addAuth.menu.checkedKeys = res.data.menu.select
                                this.addAuth.menu.saveKeys = res.data.menu.menuIds

                                this.addAuth.visible = true
                            } else {
                                this.$message.error(res.msg, 2)
                            }
                        })

                    },
                    onMenuChecked: (checkedKeys, info) => {
                        console.log(info)
                        console.log(info.halfCheckedKeys)
                        // this.selectedKeys.push(checkedKeys)
                        this.addAuth.menu.checkedKeys = checkedKeys;
                        if (this.addAuth.menu.saveKeys.indexOf(info.halfCheckedKeys) === -1) {
                            this.addAuth.menu.saveKeys = checkedKeys.concat(info.halfCheckedKeys);
                        }
                    },
                    onMenuExpand: (expandedKeys) => {
                        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
                        // or, you can remove all expanded children keys.
                        this.addAuth.menu.expandedKeys = expandedKeys;
                        this.addAuth.menu.autoExpandParent = false;
                    },
                    onAuthChecked: (checkedKeys, info) => {
                        console.log(info)
                        console.log(checkedKeys)
                        this.addAuth.auth.checkedKeys = checkedKeys;
                        if (this.addAuth.auth.saveKeys.indexOf(info.halfCheckedKeys) === -1) {
                            this.addAuth.auth.saveKeys = checkedKeys.concat(info.halfCheckedKeys);
                        }
                    },
                    onAuthExpand: (expandedKeys) => {
                        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
                        // or, you can remove all expanded children keys.
                        this.addAuth.auth.expandedKeys = expandedKeys;
                        this.addAuth.auth.autoExpandParent = false;
                    },
                    cancelAdd: () => {
                        this.addAuth.visible = false
                        this.addAuth.form = {}
                        this.addAuth.menu.checkedKeys = []
                        this.addAuth.auth.checkedKeys = []
                    },
                    handleAddOk: () => {

                        let data = {
                            tenant: {...this.addAuth.tenant},
                            role: {...this.addAuth.role},
                            roleMenuList: this.addAuth.menu.saveKeys.map(id=>{
                                return {
                                    menuId: id
                                }
                            }),
                            roleAuthorityList: this.addAuth.auth.saveKeys.map(id=>{
                                return {
                                    authorityId: id
                                }
                            })
                        }

                        this.addAuth.visible = false

                        if (this.addAuth.mode === 'SCHEMA'){
                            this.$store.state.tenantHost = this.addAuth.tenant.host
                        }
                        this.$http.post('/framework/admin/sysTenant/config/update', data).then(res=>{
                            if (this.addAuth.mode === 'SCHEMA'){
                                this.$store.state.tenantHost = ''
                            }
                            if (res.success){
                                this.$message.success('保存成功', 2)
                                this.fetch()
                            }else {
                                this.$message.error(res.msg, 2)
                            }
                        })
                    },

                    syncDb: (record) => {
                        if (this.addAuth.mode === 'SCHEMA'){
                            this.$store.state.tenantHost = record.host
                            this.$http.get('/framework/admin/sysTenant/database/sync').then(res=>{
                                this.$store.state.tenantHost = ''
                                if (res.success){
                                    this.$message.success('租户数据库同步成功', 2);
                                }
                            })
                        }
                    }

                },


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
                    sort: {
                        field: sorter.field,
                        order: sorter.order
                    }
                });
            },
            fetch(params = {}) {
                this.loading = true;
                var query = [
                    {
                        fieldName: 'name',
                        operator: 'LIKE',
                        value: this.searchName
                    },
                    {
                        fieldName: 'host',
                        operator: 'LIKE',
                        value: this.searchHost
                    }
                ]
                const data = {
                    size: this.pagination.pageSize,
                    page: this.pagination.current,
                    example: this.filters,
                    query,
                    ...params,
                };

                const that = this;
                this.$http.post('/framework/admin/sysTenant/list', data).then(res => {
                    if (res.success) {

                        const data = res.data;

                        const pagination = {...that.pagination};
                        pagination.total = data.total;


                        that.data = data.result;
                        that.pagination = pagination;

                    }
                  that.loading = false;

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
            // 获取权限列表
            getAuthList() {
                this.$http.get('/framework/admin/authority/treeCombo').then(res => {
                    if (res.success) {
                        this.addAuth.auth.treeData = res.data
                    }
                })
            },
            // 获取菜单列表
            getMenuList() {
                this.$http.get('/framework/admin/menu/treeCombo').then(res => {
                    if (res.success) {
                        this.addAuth.menu.treeData = res.data
                    }
                })
            },

            handleSubmit() {
                this.$refs.tenantForm.validate(valid => {
                    if (valid) {
                        let data = {
                            ...this.tenantForm,
                            expired: moment(this.tenantForm.expired).format('YYYY-MM-DD HH:mm:ss')
                        }
                        console.log(data)
                        let url = ''
                        if (this.isAdd) {
                            url = '/framework/admin/sysTenant/add'
                        } else {
                            url = '/framework/admin/sysTenant/update'
                        }
                        this.$http.post(url, data).then(res => {
                            if (res.success) {
                                this.$message.success('增加成功！', 2);
                                this.tenantForm = {}
                                this.isAdd = true
                                this.modalVisible = false;
                                this.fetch();
                                if (this.isAdd){
                                    this.initSchemaData(data.host, res.data)
                                }
                            } else {
                                this.$message.error(res.msg, 2);
                            }
                        })
                    }
                })
            },
            handleCancel() {
                this.modalVisible = false
                this.$refs.tenantForm.resetFields()
            },
            // 验证手机号格式
            validateToPhone(rule, value, callback) {
                if (value == null || value === '') callback('');
                else {
                    var reg1 = /^\d{3}-\d{7,8}|\d{4}-\d{7,8}$/;
                    var reg2 = /(^(1[3-9])\d{9}$)/;
                    if (reg1.test(value) || reg2.test(value)) {
                        callback();
                    } else {
                        callback('请输入有效的手机或座机号码');
                    }
                }
            },

            onSelectChange(selectedRowKeys) {
                this.selectedRowKeys = selectedRowKeys;
            },


            //---delete---
            handleDelete() {

                const that = this;
                this.$http.post('/framework/admin/sysTenant/delete', this.selectedRowKeys).then(res => {

                    if (res.success) {
                        that.$message.success('删除成功！', 2);

                        that.fetch();

                        that.selectedRowKeys = [];    //--把选中的行数据恢复---
                    } else {
                        that.$message.error(res.msg)
                    }

                });
            },


            //---search---
            onSearch() {
                this.pagination.current = 1;
                this.fetch();
            },
            resetSearch() {
                this.searchName = null
                this.searchHost = null
                this.fetch()
            },

            initSchemaData(host, tenantId){
                if (this.addAuth.mode === 'SCHEMA'){
                    setTimeout(()=>{
                        this.$store.state.tenantHost = host
                        this.$http.get('/framework/admin/sysTenant/config?tenantId=' + tenantId).then(res=>{
                            this.$store.state.tenantHost = ''
                            if (res.success){
                                // this.$message.success('租户初始化数据成功', 2);
                                console.log(res);
                            }else {
                                this.$message.error(res.msg, 2);
                            }
                        })
                    }, 10)
                }
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

    .hide-info-class {
        display: none;
    }

    .custom-filter-dropdown {
        padding: 8px;
        border-radius: 4px;
        background: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, .15);
    }

    .highlight {
        background-color: rgb(255, 192, 105);
        padding: 0px;
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
        margin-top: 2vh;
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

            .ant-btn[disabled] {
                color: rgba(0, 0, 0, 0.25) !important;
                border-color: #d9d9d9 !important;
            }
        }
    }

    .add_drawer {
        .form_item {
            display: flex;
            align-items: center;

            .item_label {
                margin-right: 10px;
            }

            &:nth-of-type(5) {
                margin-bottom: 40px;
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