<template>
    <div class="container">
        <div class="top_handle_area">
            <div class="search_item">
                <div class="search_label">姓名/用户账号</div>
                <a-input type="text" v-model="searchUsername" placeholder="请输入姓名或用户账户" style="width: 230px"></a-input>
            </div>
            <div class="search_item">
                <div class="search_label">用户角色</div>
                <a-select style="width:152px;" v-model="searchRoleId" allowClear placeholder="请选择用户角色">
                    <a-select-option v-for="role in roleList" :key="role.id">{{ role.nickname}}</a-select-option>
                </a-select>
            </div>
            <div class="search_item">
                <div class="search_label">手机号</div>
                <a-input type="text" v-model="searchPhone" placeholder="请输入手机号码" style="width: 230px"></a-input>
            </div>
            <div class="btn_area">
                <a-button type="primary" @click="onSearch">查询</a-button>
                <a-button @click="resetSearch">重置</a-button>
            </div>
        </div>
        <div class="bot_content_area">
            <div class="top_info">
                <div class="info_title">用户管理</div>
                <div class="info_handle">
                    <a-button @click="add.show">新增用户</a-button>
                </div>
            </div>
            <div class="table_area">
                <a-table :columns="columns"
                         :rowKey="record => record.id"
                         :dataSource="data"
                         :pagination="pagination"
                         :loading="loading"
                         :bordered="true"
                         class="user_list"
                         @change="handleTableChange"
                         :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '暂无数据'}"
                         :scroll="{ x: true }"
                >
                    <span slot="num" slot-scope="text, record, index">
                        {{ (pagination.current - 1) * pagination.pageSize + parseInt(index) + 1 }}
                    </span>
                    <span slot="action" slot-scope="record">
                        <a-button type="link" @click="edit.show(record)">编辑</a-button>
                        <a-popconfirm placement="top" okText="确定" cancelText="取消" @confirm="handleDelete(record)">
                            <template slot="title">
                                <p>是否删除该用户</p>
                            </template>
                            <a-button type="link" >删除</a-button>
                        </a-popconfirm>
                        <a-button type="link" @click="resetPwd(record)">重设密码</a-button>
                        <a-button type="link" @click="app.show(record)">应用配置</a-button>
                    </span>

                </a-table>
            </div>
        </div>

        <!--    新增/编辑用户    -->
        <a-modal
                :title="isAdd?'新增用户':'编辑用户'"
                v-model="visible"
                okText="确认"
                cancelText="取消"
                @ok="handleSubmit"
                @cancel="handleCancle"
        >
            <a-form-model :model="form" :rules="rules" ref="userForm" :labelCol="{ span: 5 }" :wrapperCol="{ span: 14, offset: 1 }">
                <a-form-model-item label="用户名" prop="username">
                    <a-input type="text" placeholder="请输入用户名" v-model="form.username"></a-input>
                </a-form-model-item>
                <a-form-model-item label="姓名" prop="name">
                    <a-input type="text" placeholder="请输入姓名" v-model="form.name"></a-input>
                </a-form-model-item>
                <a-form-model-item label='手机号' prop="phone">
                    <a-input type="text" placeholder="请输入手机号" v-model="form.phone">
                    </a-input>
                </a-form-model-item>
                <a-form-model-item label='地址' prop="address">
                    <a-input type="text" placeholder="请输入地址" v-model="form.address">
                    </a-input>
                </a-form-model-item>
                <a-form-model-item label='邮箱' prop="email">
                    <a-input type="text" placeholder="请输入邮箱" v-model="form.email">
                    </a-input>
                </a-form-model-item>
                <a-form-model-item label='默认角色' prop="roleId">
                    <a-select placeholder="选择角色"  :allowClear="true" v-model="form.roleId">
                        <a-select-option v-for="role in roleList" :key="role.id">{{ role.nickname}}</a-select-option>
                    </a-select>
                </a-form-model-item>
                <a-form-model-item label='默认部门' prop="departmentId">
                    <a-tree-select style="width: 100%;"
                                   :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                                   :tree-data="departmentList"
                                   show-search
                                   allowClear
                                   placeholder="选择部门"
                                   tree-default-expand-all
                                   :replaceFields="{value:'id',title:'title'}"
                                   v-model="form.departmentId"
                    >
                    </a-tree-select>
                </a-form-model-item>
            </a-form-model>

        </a-modal>

        <a-drawer title="应用配置"
                  :visible="app.visible"
                  @close="app.close"
                  :width="700"
                  class="users_drawer"
        >
            <div class="head_area">
                <a-button style="border-color: #347DF7;color: #347DF7;" @click="app.config.show">新增</a-button>
            </div>
            <div class="list_area">
                <a-table :columns="app.colums"
                         :rowKey="record => record.id"
                         :bordered="true"
                         :dataSource="app.data"
                         class="users_list"
                         :pagination="app.pagination"
                         size="small"
                >
                    <span slot="idx" slot-scope="text,record,index">
                        {{ (app.pagination.current - 1) * app.pagination.pageSize + parseInt(index) + 1 }}
                    </span>
                    <span slot="handle" slot-scope="record">
                        <a-popconfirm placement="top" okText="确定" cancelText="取消" @confirm="app.remove(record)">
                            <template slot="title">
                                <p>是否移除该用户</p>
                            </template>
                            <a-button type="link">移除</a-button>
                        </a-popconfirm>
                    </span>

                </a-table>
            </div>
            <div class="handle_area">
                <a-button style="margin-right: 30px" @click="app.close">取消</a-button>
                <a-button type="primary" @click="app.close">保存</a-button>
            </div>
        </a-drawer>

        <a-modal title="新增配置"
                 :visible="app.config.visible"
                 @ok="app.config.ok"
                 @cancel="app.config.cancel"
        >
            <a-form  :labelCol="{ span: 3 }" :wrapperCol="{ span: 18, offset: 1 }">
                <a-form-item label="应用名称">
                    <a-input v-model="app.config.form.app" placeholder="应用名称" type="text" />
                </a-form-item>
                <a-form-item label="应用角色">
                    <a-select  v-model="app.config.form.roleId" allowClear placeholder="选择应用角色">
                        <a-select-option v-for="role in roleList" :key="role.id">{{ role.nickname}}</a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>

    </div>
</template>

<script>
    import moment from 'moment'
    const columns = [
        {
            title: '序号',
            scopedSlots: {customRender: 'num'},
            align: 'center',
        },
        {
            title: '账号',
            dataIndex: 'username'
        },
        {
            title: '姓名',
            dataIndex: 'name'
        },
        {
            title: '用户别名',
            dataIndex: 'nickname',
            align: "center",
            customRender:function(text){
                if(!text){
                    return '-'
                }else {
                    return text
                }
            }
        },
        {
            title: '手机号',
            dataIndex: 'phone'
        },
        {
            title: '默认角色',
            dataIndex: 'role',
            align: "center",
            customRender:function(text){
                if(!text){
                    return '-'
                }else {
                    return text
                }
            }
        },
        {
            title: '注册时间',
            dataIndex: 'created',
            customRender:function(text){
                return moment(text).format('YYYY-MM-DD HH:mm:ss')
            }
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'},
        }
    ];

    export default {
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
                filters: {},
                example:{},
                query:[],
                searchUsername:undefined,
                searchRoleId:undefined,
                searchPhone:undefined,

                /* 用户相关功能 */
                isAdd:true,
                visible:false,
                roleList: [],
                departmentList:[],
                form: {},
                rules:{
                    username: [{required: true, message: '请输入用户名'}, {max: 20, message: '输入长度不超过20'}],
                    name: [{required: true, message: '请输入姓名'}, {max: 20, message: '输入长度不超过20'}],
                    phone: [{required: true, message: '请输入手机号'}, {validator: this.validateToPhone, trigger: 'blur'}],
                    address: [{max: 100, message: '输入长度不超过100'}],
                    email: [{validator: this.validateToEmail, trigger: 'blur'}],
                    roleId: [{required: true, message: '请选择用户角色'}],
                    departmentId: [{required: true, message: '请选择所属部门', trigger: 'change'}]
                },
                // 新增用户
                add:{
                    // 添加 add
                    show:()=>{
                        this.isAdd = true
                        this.visible = true
                    },
                    ok:()=>{
                        this.$refs.userForm.validate(valid => {
                            if(valid) {
                                this.$http.post('/framework/admin/user/add', this.form).then(res => {

                                    if (res.success) {
                                        this.$message.success('增加成功！', 2);
                                        this.form = {}
                                        this.visible = false
                                        this.fetch();
                                    } else {
                                        this.$message.error(res.msg, 2);
                                    }
                                });
                            }
                        })
                    }
                },
                // 编辑用户
                edit:{
                    // update
                    show:(record)=>{
                        this.isAdd = false
                        this.visible = true
                        this.form = {...record}
                    },
                    ok:()=>{
                        this.$refs.userForm.validate(valid => {
                            if(valid) {
                              const requestObj = this.form
                              delete requestObj.role
                                this.$http.post('/framework/admin/user/update',requestObj).then(res=>{
                                    if(res.success) {
                                        this.$message.success('更新成功',2)
                                        this.form = {}
                                        this.visible = false
                                        this.fetch()
                                    }else {
                                        this.$message.error(res.msg, 2);
                                    }
                                })
                            }
                        })
                    }
                },

                app: {
                    visible: false,
                    close: ()=>{
                        this.app.visible = false
                    },
                    show: (record)=>{
                        this.app.visible = true
                        this.app.user = {...record}
                        this.app.example['userId'] = record.id
                        this.app.fetch()
                    },
                    colums: [
                        {
                            title: '序号',
                            scopedSlots: {customRender: 'idx'},
                            align: 'center',
                            width: 100,
                        },
                        {
                            title: '应用',
                            dataIndex: 'app',
                            width: 150,
                            align: 'center'
                        },
                        {
                            title: '角色',
                            dataIndex: 'role',
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
                    user: {},
                    pagination: {
                        pageSize: 10,
                        current: 1,
                        total: 0
                    },
                    example:{},
                    fetch: ()=>{
                        const data = {
                            size: this.app.pagination.pageSize,
                            page: this.app.pagination.current,
                            example: this.app.example
                        };
                        this.$http.post('/framework/admin/user/app/list', data).then(res=>{
                            if (res.success){
                                const data = res.data
                                const pagination = {...this.app.pagination}
                                pagination.total = data.total;
                                this.app.data = data.result
                                this.app.pagination = pagination
                            }else {
                                this.$message.error(res.msg, 2)
                            }
                        })
                    },
                    remove: (record)=>{
                        this.$http.get('/framework/admin/user/app/delete?id='+record.id).then(res=>{
                            if (res.success){
                                this.app.fetch()
                                this.$message.success("操作成功", 2)
                            }else {
                                this.$message.error(res.msg, 2)
                            }
                        })
                    },
                    config:{
                        visible: false,
                        form:{},
                        show: ()=>{
                            this.app.config.visible = true
                            this.app.config.form = {
                                userId: this.app.user.id
                            }
                        },
                        ok: () =>{
                            this.$http.post('/framework/admin/user/app/add', {...this.app.config.form}).then(res=>{
                                if (res.success){
                                    this.$message.success("操作成功", 2)
                                    this.app.fetch()
                                    this.app.config.visible = false
                                }else {
                                    this.$message.error(res.msg, 2)
                                }
                            })
                        },
                        cancel: ()=>{
                            this.app.config.visible = false
                        }

                    }
                }

            }
        },
        mounted() {
            this.fetch();
            this.fetchRoleList();
            this.fetchDepartmentList();
            this.$on('tenantChange', ()=>{
                this.fetch();
                this.fetchRoleList();
                this.fetchDepartmentList();
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
            fetch() {
                this.loading = true;
                var query = [
                    {
                        fieldName:'name',
                        operator:'LIKE',
                        value:this.searchUsername,
                    },
                    {
                        fieldName:'username',
                        operator:'LIKE',
                        value:this.searchUsername,
                    },
                    {
                        fieldName:'roleId',
                        operator:'EQ',
                        value:this.searchRoleId,
                    },
                    {
                        fieldName:'phone',
                        operator:'EQ',
                        value:this.searchPhone,
                    },
                ]

                const data = {
                    size: this.pagination.pageSize,
                    page: this.pagination.current,
                    example: this.example,
                    query,
                };
                const that = this;
                this.$http.post('/framework/admin/user/list', data).then( res =>  {
                    if (res.success){
                        const data = res.data;
                        const pagination = {...that.pagination};
                        pagination.total = data.total;
                        that.loading = false;
                        that.data = data.result;
                        that.pagination = pagination;
                        // that.example = {}
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
            fetchRoleList() {
                this.$http.get('/framework/admin/role/combo').then(res => {
                    if (res.success){
                        this.roleList = res.data
                    }
                })
            },
            fetchDepartmentList() {
                this.$http.get('/framework/admin/department/page').then(res => {
                    if (res.success){
                        this.departmentList = res.data;
                    }
                })
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
            // 验证邮箱格式
            validateToEmail(rule, value, callback) {
                if (value == null || value === '') {
                    callback();
                } else if (value.length > 255) {
                    callback('地址长度过大!');
                } else {
                    var reg = /(^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$)/;
                    if (reg.test(value)) {
                        callback();
                    } else {
                        callback('请输入有效的邮箱地址!');
                    }
                }
            },

            // 表单提交
            handleSubmit() {
                if(this.isAdd) {
                    this.add.ok()
                }else {
                    this.edit.ok()
                }
            },
            // 取消表单提交
            handleCancle() {
                this.visible = false
                this.$refs.userForm.resetFields()
            },

            // 用户删除
            handleDelete(record) {
                let arr = [record.id]
                let ids = JSON.parse(JSON.stringify(arr))
                const that = this;
                this.$http.post('/framework/admin/user/delete', ids).then(res=> {
                    if (res.success){
                        that.$message.success('删除成功！', 2);
                        that.fetch();
                    }else {
                        this.$message.error(res.msg+'，不能删除',2)
                    }
                }).catch((res)=>{
                    if(res.response.status === 500) {
                        this.$message.error(res.response.data.msg+'，不能删除',2)
                    }
                });
            },

            //---search---
            onSearch() {
                this.pagination.current = 1;
                this.fetch();
            },
            resetSearch(){
                this.searchUsername = null
                this.searchRoleId = null
                this.searchPhone = null
                this.fetch()
            },
            resetPwd(record){
              const requestObj = JSON.parse(JSON.stringify(record))
              delete requestObj.role
                this.$http.post('/framework/admin/user/pwd/reset', requestObj).then(res=>{
                    if (res.success){
                        this.$message.success("重置成功")
                    }else {
                        this.$message.error(res.msg, 2)
                    }
                })
            }

        },
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

    .ant-table-thead > tr > th {
        min-width: 130px !important;
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
        padding: 0;
    }

    .top_handle_area {
        width: 100%;
        height: 8vh;
        background: #ffffff;
        display: flex;
        align-items: center;
        padding: 0 25px;
        margin-bottom: 2vh;
        .search_item {
            display: flex;
            align-items: center;
            margin-right: 30px;
            .search_label {
                margin-right: 20px;
            }
        }
        .btn_area button {
            min-width: 80px;
            margin-left: 20px;
            &:last-child {
                color: #1890FF;
                border-color: #1890FF;
            }
        }
        .submit_area {
            margin-left: 80px;
            margin-right: 30px;
            font-size: 16px;
            color: #347DF7;
            cursor: pointer;
        }
    }

    .bot_content_area {
        width: 100%;
        margin-top: 2vh;
        background: #ffffff;
        min-height: 78vh;
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

    .import_modal {
        .modal_content {
            display: flex;
            justify-content: center;
        }
        .left_download,.right_improt {
            flex: 1;
            height: 260px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            .head_info {
                font-size: 14px;
                font-weight: bold;
            }
            .icon_area {
                margin: 40px 0 18px;
            }
            button {
                margin-top: 14px;
                border-radius: 25px;
            }
        }
        .left_download {
            border-right: 1px dashed #BBBBBB;
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
