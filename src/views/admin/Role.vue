<template>
    <div class="container">
        <div class="top_handle_area">
            <div class="row_item" style="justify-content: flex-start;">
                <div class="search_item">
                    <div class="search_label">角色名称</div>
                    <a-input type="text" allowClear v-model="keywords" placeholder="请输入角色名称" class="search_area"></a-input>
                </div>
                <div class="search_item">
                    <a-button type="primary" @click="onSearch">查询</a-button>
                    <a-button @click="resetSearch">重置</a-button>
                </div>
            </div>
        </div>
        <div class="bot_content_area">
            <div class="top_info">
                <div class="info_title">角色管理</div>
                <div class="info_handle">
                    <a-button @click="add.show">新增角色</a-button>
                </div>
            </div>
            <div class="table_area">
                <a-table :columns="columns"
                         :rowKey="record => record.id"
                         :dataSource="data"
                         :pagination="pagination"
                         :loading="loading"
                         :bordered="true"
                         class="role_list"
                         @change="handleTableChange"
                         :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '暂无数据'}"
                >
                    <span slot="num" slot-scope="text, record, index">
                        {{ (pagination.current - 1) * pagination.pageSize + parseInt(index) + 1 }}
                    </span>
                    <span slot="action" slot-scope="record">
                        <a-popconfirm placement="top" okText="确定" cancelText="取消" @confirm="handleDelete(record)">
                            <template slot="title">
                                <p>是否删除该角色</p>
                            </template>
                            <a-button type="link" style="margin-right: 5px">删除</a-button>
                        </a-popconfirm>
                        <a-button type="link" @click="update.show(record)" style="margin-right: 5px">权限配置</a-button>
                        <a-button type="link" @click="entity.show(record)" style="margin-right: 5px">数据约束</a-button>
                        <a-button type="link" @click="user.show(record)" style="margin-right: 15px">对应人员</a-button>
                    </span>
                </a-table>
            </div>
        </div>

        <a-drawer :title="title"
                  :visible="visible"
                  @close="cancelSubmit"
                  :width="700"
                  class="add_drawer"
        >
            <div class="form_item">
                <div class="item_label">角色名称：</div>
                <a-input v-model="roleForm.nickname" label="角色名称" placeholder="请输入角色名称" style="width: 300px"></a-input>
            </div>
            <a-divider/>
            <div class="form_item">
                <div class="item_label">菜单管理：</div>
                <a-tree
                        v-model="menu.checkedKeys"
                        checkable
                        :selectable="false"
                        :show-line="true"
                        :expanded-keys="menu.expandedKeys"
                        :autoExpandParent="menu.autoExpandParent"
                        :checked-keys="menu.checkedKeys"
                        :tree-data="menu.treeData"
                        @expand="menu.onMenuExpand"
                        @check="menu.onMenuChecked"
                />
            </div>
            <a-divider/>
            <div class="form_item">
                <div class="item_label">权限管理：</div>
                <a-tree
                        v-model="auth.checkedKeys"
                        checkable
                        :selectable="false"
                        :show-line="true"
                        :expanded-keys="auth.expandedKeys"
                        :autoExpandParent="auth.autoExpandParent"
                        :checked-keys="auth.checkedKeys"
                        :tree-data="auth.treeData"
                        @expand="auth.onAuthExpand"
                        @check="auth.onAuthChecked"
                />
            </div>
            <div class="handle_area">
                <a-button style="margin-right: 30px" @click="cancelSubmit">取消</a-button>
                <a-button type="primary" @click="handleSubmit">保存</a-button>
            </div>

        </a-drawer>


        <a-drawer title="数据约束"
                  :visible="entity.visible"
                  @close="entity.close"
                  :width="700"
                  class="users_drawer"
        >
            <div class="form_item">
                <a-tree
                        v-model="entity.checkedKeys"
                        checkable
                        :selectable="false"
                        :show-line="true"
                        :expanded-keys="entity.expandedKeys"
                        :autoExpandParent="entity.autoExpandParent"
                        :checked-keys="entity.checkedKeys"
                        :tree-data="entity.treeData"
                        @expand="entity.onAuthExpand"
                        @check="entity.onAuthChecked"
                />
            </div>
            <div class="handle_area">
                <a-button style="margin-right: 30px" @click="entity.close">取消</a-button>
                <a-button type="primary" @click="entity.save">保存</a-button>
            </div>
        </a-drawer>




        <a-drawer title="对应人员"
                  :visible="user.visible"
                  @close="user.close"
                  :width="700"
                  class="users_drawer"
        >
            <div class="head_area">
                <div class="left_name">{{ user.role.nickname }}（{{ user.data.length }}）</div>
                <a-button style="border-color: #347DF7;color: #347DF7;" @click="user.add.show">新增</a-button>
            </div>
            <div class="list_area">
                <a-table :columns="user.colums"
                         :rowKey="record => record.id"
                         :bordered="true"
                         :dataSource="user.data"
                         class="users_list"
                         :pagination="user.pagination"
                         :loading="user.loading"
                >
                    <span slot="idx" slot-scope="text,record,index">
                        {{ (user.pagination.current - 1) * user.pagination.pageSize + parseInt(index) + 1 }}
                    </span>
                    <span slot="handle" slot-scope="record">
                        <a-popconfirm placement="top" okText="确定" cancelText="取消" @confirm="user.remove(record)">
                            <template slot="title">
                                <p>是否移除该用户</p>
                            </template>
                            <a-button type="link">移除</a-button>
                        </a-popconfirm>
                    </span>

                </a-table>
            </div>
            <div class="handle_area">
                <a-button style="margin-right: 30px" @click="user.close">取消</a-button>
                <a-button type="primary" @click="user.close">保存</a-button>
            </div>
        </a-drawer>


        <a-modal title="选择人员"
                 :visible="user.add.visible"
                 :confirm-loading="user.add.confimLoading"
                 @ok="user.add.ok"
                 @cancel="user.add.cancel"
        >
            <div class="add_user_search">
                <div class="search_label">已选择{{ user.add.selectedRowKeys.length }}个</div>
                <a-input-search placeholder="搜索" v-model="user.add.name" style="width: 270px"
                                @search="user.add.fetch"/>
            </div>
            <div class="table_area">
                <a-table :columns="user.add.colums"
                         :rowKey="record => record.id"
                         :pagination="user.add.pagination"
                         :dataSource="user.add.data"
                         :loading="user.add.loading"
                         :rowSelection="{ selectedRowKeys: user.add.selectedRowKeys, onSelect: user.add.onSelect }"
                         :bordered="true"
                         class="role_user_list"
                         @change="user.add.handleUserTableChange"
                         :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '暂无数据'}"
                         :scroll="{ x : true }"
                         size="small"
                >
                </a-table>
            </div>
        </a-modal>

        <a-modal title="批量备注"
                 :visible="user.note.visible"
                 @ok="user.note.ok"
                 @cancel="user.note.cancel"
        >
            <a-form  :labelCol="{ span: 3 }" :wrapperCol="{ span: 18, offset: 1 }">
                <a-form-item label="备注">
                    <a-input v-model="user.note.form.note" placeholder="用户角色关联备注" type="text" />
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
            align: 'center',
            width: 100,
        },
        {
            title: '角色名称',
            dataIndex: 'nickname',
        },
        {
            title: '角色代码',
            dataIndex: 'name',
        },
        {
            title: '创建时间',
            dataIndex: 'created',
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'},
            width: 500
        }
    ];

    export default {
        data() {
            return {
                userinfo: this.$store.state.userinfo,
                columns,
                data: [],
                pagination: {
                    pageSize: 10,
                    current: 1,
                    total: 0
                },
                loading: false,
                filters: {},
                query: [],
                example: {},
                keywords: null,

                /* 角色增加/编辑 */
                visible: false,
                roleForm: {},
                title: "",
                menu: {
                    expandedKeys: [],
                    autoExpandParent: true,
                    checkedKeys: [],
                    saveKeys: [],
                    treeData: [],

                    // 选择菜单
                    onMenuChecked: (checkedKeys, info) => {
                        this.menu.checkedKeys = checkedKeys;
                        this.menu.saveKeys = [...checkedKeys, ...info.halfCheckedKeys]
                    },

                    // 展开菜单
                    onMenuExpand: (expandedKeys) => {
                        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
                        // or, you can remove all expanded children keys.
                        this.menu.expandedKeys = expandedKeys;
                        this.menu.autoExpandParent = false;
                    },

                },
                auth: {
                    expandedKeys: [],
                    autoExpandParent: true,
                    checkedKeys: [],
                    saveKeys: [],
                    treeData: [],

                    // 选择权限
                    onAuthChecked: (checkedKeys, info) => {
                        this.auth.checkedKeys = checkedKeys;
                        this.auth.saveKeys = [...checkedKeys, ...info.halfCheckedKeys];
                    },

                    // 展开权限
                    onAuthExpand: (expandedKeys) => {
                        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
                        // or, you can remove all expanded children keys.
                        this.auth.expandedKeys = expandedKeys;
                        this.auth.autoExpandParent = false;
                    }

                },
                /* 数据约束配置 */
                entity:{
                    visible: false,
                    role: {},
                    show: (record)=>{
                        this.entity.visible = true
                        this.entity.role = {...record}

                        this.$http.get('/framework/admin/data/treeCombo/select?roleId='+record.id).then(res=>{
                            if (res.success){
                                this.entity.treeData = res.data.combo
                                this.entity.checkedKeys = res.data.select
                                this.entity.saveKeys = res.data.dataIds
                            }else {
                                this.$message.error(res.msg, 2)
                            }
                        })

                    },
                    close: () =>{
                        this.entity.role = {}
                        this.entity.visible = false
                    },
                    save: () =>{
                        let roleDataList = []
                        if (this.entity.saveKeys.length > 0){
                            roleDataList = this.entity.saveKeys.map(id => {
                                return {
                                    roleId: this.entity.role.id,
                                    roleName: this.entity.role.name,
                                    dataId: id
                                }
                            })
                        }

                        let data = {
                            role : this.entity.role,
                            roleDataList: roleDataList
                        }

                        this.$http.post('/framework/admin/data/treeCombo/select/save', data).then(res =>{
                            if (res.success){
                                this.$message.success('保存成功', 2)
                                this.entity.visible = false
                            }else {
                                this.$message.error(res.msg, 2)
                            }
                        })
                    },

                    expandedKeys: [],
                    autoExpandParent: true,
                    checkedKeys: [],
                    saveKeys: [],
                    treeData: [],

                    // 选择权限
                    onAuthChecked: (checkedKeys, info) => {
                        this.entity.checkedKeys = checkedKeys;
                        this.entity.saveKeys = [...checkedKeys, ...info.halfCheckedKeys];
                    },

                    // 展开权限
                    onAuthExpand: (expandedKeys) => {
                        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
                        // or, you can remove all expanded children keys.
                        this.entity.expandedKeys = expandedKeys;
                        this.entity.autoExpandParent = false;
                    }
                },


                add: {
                    show: () => {
                        this.visible = true;
                        this.roleForm = {}
                        this.title = "新增角色"
                        this.auth.checkedKeys = []
                        this.menu.checkedKeys = []
                        this.menu.saveKeys = []

                        this.add.getAuthList();
                        this.add.getMenuList();
                    },

                    // 获取权限列表
                    getAuthList: () => {
                        this.$http.get('/framework/admin/authority/treeCombo').then(res => {
                            if (res.success) {
                                this.auth.treeData = res.data
                            }
                        })
                    },
                    // 获取菜单列表
                    getMenuList: () => {
                        this.$http.get('/framework/admin/menu/treeCombo').then(res => {
                            if (res.success) {
                                this.menu.treeData = res.data
                            }
                        })
                    }

                },
                update: {
                    show: (record) => {
                        this.title = "修改角色"
                        this.roleForm = {...record}
                        this.visible = true

                        this.$http.get('/framework/admin/menu/treeCombo/select?roleId='+record.id).then(res=>{
                            if (res.success){
                                this.menu.treeData = res.data.combo
                                this.menu.checkedKeys = res.data.select
                                this.menu.saveKeys = res.data.menuIds
                            }else {
                                this.$message.error(res.msg, 2)
                            }
                        })

                        this.$http.get('/framework/admin/authority/treeCombo/select?roleId='+record.id).then(res=>{
                            if (res.success){
                                this.auth.treeData = res.data.combo
                                this.auth.checkedKeys = res.data.select
                                this.auth.saveKeys = res.data.authorityIds
                            }else {
                                this.$message.error(res.msg, 2)
                            }
                        })

                    }
                },

                /* 对应人员相关功能 */
                user: {
                    colums:[
                        {
                            title: '序号',
                            scopedSlots: {customRender: 'idx'},
                            align: 'center',
                            width: 100,
                        },
                        {
                            title: '姓名',
                            dataIndex: 'name',
                            width: 150,
                            align: 'center'
                        },
                        {
                            title: '手机号',
                            dataIndex: 'phone',
                            width: 150,
                            align: 'center'
                        },
                        {
                            title: '操作',
                            key: 'handle',
                            align: 'center',
                            scopedSlots: {customRender: 'handle'},
                            width: 100,
                        }
                    ],
                    data: [],
                    visible: false,
                    loading: false,
                    role: {},
                    pagination: {
                        pageSize: 10,
                        current: 1,
                        total: 0
                    },
                    show: (record) => {
                        this.user.visible = true
                        this.user.role = {...record}
                        this.user.fetch(record.id)
                    },
                    fetch: (id) => {
                        this.user.loading = true
                        const that = this;
                        const data = {
                            size: this.user.pagination.pageSize,
                            page: this.user.pagination.current,
                            example: {
                                "roleId": id
                            },
                        };
                        this.$http.post('/framework/admin/user/role/list', data).then(res => {
                            if (res.success) {
                                const data = res.data;
                                const pagination = {...that.user.pagination};
                                pagination.total = data.total;
                                that.user.loading = false;
                                that.user.data = data.result;
                                that.user.pagination = pagination;
                            }

                        }).catch((error) => {
                            if (error) {
                                that.$message.error('系统错误', 2)
                                that.user.loading = false;
                            }
                        });
                    },
                    close: () => {
                        this.user.visible = false
                        this.user.role = {}
                        this.user.data = []
                    },
                    remove: (record) => {
                        const data = {
                            userId: record.userId,
                            roleId: this.user.role.id
                        }
                        this.$http.post('/framework/admin/user/role/delete', data).then(res => {
                            if (res.success) {
                                this.$message.success('移除成功', 2)
                                this.user.fetch(data.roleId)
                                this.fetch()
                            } else {
                                this.$message.error(res.msg, 2)
                            }
                        })
                    },
                    add:{
                        colums:[
                            {
                                title: '姓名',
                                dataIndex: 'name',
                                width: 150,
                                align: 'center'
                            },
                            {
                                title: '手机号',
                                dataIndex: 'phone',
                                width: 150,
                                align: 'center'
                            }
                        ],
                        data: [],
                        visible: false,
                        loading: false,
                        confimLoading: false,
                        pagination: {
                            pageSize: 10,
                            current: 1,
                            total: 0
                        },
                        selectedRowKeys: [],
                        name: '',
                        show: () => {
                            this.user.add.fetch()
                            this.user.add.visible = true
                        },
                        handleUserTableChange: (pagination, filters) => {
                            const pager = {...this.user.add.pagination};    //---防止对象引用复制---
                            pager.current = pagination.current;
                            this.user.add.pagination = pager;

                            const result = {};
                            const filterKeys = Object.keys(filters);
                            for (let i = 0; i < filterKeys.length; i++) {
                                result[filterKeys[i]] = filters[filterKeys[i]][0];
                            }
                            this.user.add.fetch();
                        },
                        fetch: ()=>{
                            this.user.add.loading = true

                            var query = [
                                {
                                    fieldName: 'name',
                                    operator: 'LIKE',
                                    value: this.user.add.name
                                }
                            ]
                            const data = {
                                size: this.user.add.pagination.pageSize,
                                page: this.user.add.pagination.current,
                                query,
                            };

                            this.$http.post('/framework/admin/user/list', data).then(res => {
                                if (res.success) {
                                    const data = res.data;
                                    const pagination = {...this.user.add.pagination};
                                    pagination.total = data.total;
                                    this.user.add.loading = false;
                                    this.user.add.data = data.result;
                                    this.user.add.pagination = pagination;
                                }

                            }).catch((error) => {
                                if (error) {
                                    this.$message.error('系统错误', 2)
                                    this.user.add.loading = false;
                                }
                            });
                        },
                        ok: ()=>{
                            let data = this.user.add.selectedRowKeys.map(uid=>{
                                return {
                                    "userId": uid,
                                    "roleId": this.user.role.id
                                }
                            })

                            this.$http.post('/framework/admin/user/role/add', data).then(res=>{
                                if (res.success){
                                    this.user.add.name = ''
                                    this.user.add.selectedRowKeys = []
                                    this.user.add.visible = false
                                    this.user.fetch(this.user.role.id)
                                    this.$message.success('用户添加成功', 2);
                                }else {
                                    this.$message.error(res.msg, 2)
                                }
                            })
                        },
                        cancel: () =>{
                            this.user.add.visible = false
                            this.user.add.name = ''
                            this.user.add.selectedRowKeys = []
                        },
                        onSelect: (record, selected) => {
                            if (selected) {
                                this.user.add.selectedRowKeys.push(record.id)
                            } else {
                                this.user.add.selectedRowKeys.splice(this.user.add.selectedRowKeys.indexOf(record.id), 1)
                            }
                        },
                    },
                    note:{
                        visible: false,
                        form:{
                            note: ""
                        },
                        show: ()=>{
                            this.user.note.visible = true
                            this.user.note.form.note = ""
                        },
                        ok: () =>{
                            let data = {
                                ...this.user.note.form,
                                roleId: this.user.role.id
                            }
                            this.$http.post('/framework/admin/user/role/note', data).then(res =>{
                                if (res.success){
                                    this.$message.success("操作成功",2)
                                    this.user.fetch(this.user.role.id)
                                    this.user.note.visible = false
                                }else {
                                    this.$message.error(res.msg)
                                }
                            })
                        },
                        cancel: ()=>{
                            this.user.note.visible = false
                        }
                    }
                },



            }
        },
        mounted() {
            this.fetch();
            this.$on('tenantChange', ()=>{
                this.fetch();
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
                    ...result
                };

                this.fetch();
            },
            // 初始化角色列表
            fetch() {
                this.loading = true;
                var query = [
                    {
                        fieldName: 'nickname',
                        operator: 'LIKE',
                        value: this.keywords
                    }
                ]
                const data = {
                    size: this.pagination.pageSize,
                    page: this.pagination.current,
                    example: this.example,
                    query,
                };

                const that = this;
                this.$http.post('/framework/admin/role/list', data).then(res => {
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



            /* 新增/编辑角色 */
            // 确认新增
            handleSubmit() {
                // this.roleForm.validateFields((err,values))
                if (this.roleForm.nickname === '' || this.roleForm.nickname == null) {
                    this.$message.error('请输入角色名称', 2)
                    return false
                } else if (this.roleForm.nickname.length > 20) {
                    this.$message.error('角色名称不超过20个字', 2)
                    return false
                }

                let data = {
                    role: {...this.roleForm, name: 'ROLE_'+this.roleForm.nickname},
                    roleMenuList: this.menu.saveKeys.map(id=>{
                        return {
                            menuId: id
                        }
                    }),
                    roleAuthorityList: this.auth.saveKeys.map(id=>{
                        return {
                            authorityId: id
                        }
                    })
                }

                this.visible = false

                this.$http.post('/framework/admin/role/complexSaveOrUpdate', data).then(res=>{
                    if (res.success){
                        this.$message.success('保存成功', 2)
                        this.fetch()
                    }else {
                        this.$message.error(res.msg, 2)
                    }
                })

            },
            // 取消新增
            cancelSubmit() {
                this.visible = false;
                this.roleForm = {}
                this.title = "新增角色"
                this.auth.checkedKeys = []
                this.menu.checkedKeys = []
            },



            // 删除角色
            handleDelete(record) {
                this.$http.get('/framework/admin/role/delete?roleId=' + record.id).then(res => {
                    if (res.success) {
                        this.$message.success('删除成功！', 2);
                        this.fetch();
                    } else {
                        this.$message.error(res.msg + '，不能删除！', 2)
                    }
                }).catch((res) => {
                    if (res.response.status === 500) {
                        this.$message.error(res.response.data.msg + '，不能删除！', 2);
                    }

                });

            },


            /* 角色搜索相关功能 */
            // 关键字查询角色
            onSearch() {
                this.pagination.current = 1;
                this.fetch();
            },
            // 取消关键字查询
            resetSearch() {
                this.keywords = null
                this.fetch()
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

    /deep/ .ant-tree > li:first-child {
        padding-top: 0;
    }

    /deep/ .ant-tree li {
        margin: 5px;
        white-space: nowrap;
        list-style: none;
        outline: 0;
    }

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

    .add_user_search {
        width: 100%;
        height: 35px;
        display: flex;
        margin: 0 auto 20px;

        .search_label {
            font-size: 15px;
            line-height: 35px;
            font-weight: bold;
            margin-right: 40px;
        }
    }

    .role_user_list {
        button {
            border: none;
            background: transparent;
            color: #1890FF;
            padding: 0 6px;
        }
    }

    .user-add {
        width: 70px;
        height: 30px;
        margin-left: 20px;

        &:last-child {
            color: #1890FF;
            border-color: #1890FF;
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

    .users_drawer {
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
