<template>
    <div class="container">
        <div class="top_handle_area">
            <div class="row_item" style="justify-content: flex-start">
                <div class="search_item">
                    <div class="search_label">部门名称</div>
                    <a-input type="text" v-model="searchDeptName" placeholder="请输入部门名称" style="width: 230px"></a-input>
                </div>
                <div class="search_item">
                    <a-button type="primary" @click="searchByDeptName">查询</a-button>
                    <a-button @click="resetSearch">重置</a-button>
                </div>
            </div>
        </div>
        <div class="bot_content_area">
            <div class="top_title">
                <div class="info_title">组织架构</div>
                <div class="info_handle">
                    <a-button @click="repairInfo">修正部门信息</a-button>
                </div>
            </div>
            <div class="bot_info">
                <div class="left_tree">
                    <a-tree :tree-data="treeData"
                            :expanded-keys="expandedKeys"
                            :selected-keys="selectedKeys"
                            :show-icon="true"
                            @select="changeSelectDept"
                            @expand="onExpand"
                            :replaceFields="{key: 'id'}"
                    >
                        <a-icon slot="switcherIcon" type="caret-down" :style="{ color: '#BDC8DB',fontSize:'16px' }" />
                        <template slot="parent">
                            <i class="iconfont iconzuzhijiagou" style="font-size: 20px;color: #B0CEFF"></i>
                        </template>
                        <a-icon slot="child" type="folder-open" :style="{ color: '#B0CEFF',fontSize:'18px' }" />
                    </a-tree>
                </div>
                <div class="right_table">
                    <a-breadcrumb separator=">" style="margin: 8px 0;">
                        <a-breadcrumb-item v-for="(item,index) in breadcrumbData"
                                           :key="index"
                                           style="font-weight: bold;font-size: 16px;"
                        >
                            {{item}}
                        </a-breadcrumb-item>
                    </a-breadcrumb>
                    <div class="department_item">
                        <div class="item_info_area">
                            <i class="iconfont iconzuzhijiagou"></i>
                            <span class="title_area">下级部门</span>
                            <a-button class="handle_btn" @click="addDepartment.show">新增子部门</a-button>
                        </div>
                        <div class="item_table_area">
                            <a-table :columns="departmentColumns"
                                     :rowKey="record => record.id"
                                     :dataSource="departmentData"
                                     :bordered="true"
                                     :pagination="false"
                                     :scroll="{y:90}"
                                     class="department_table"
                                     :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '当前部门不含下级部门   添加子部门'}"
                            >
                                <span slot="action" slot-scope="record">
                                    <a-button type="link" @click="updateDepartment.show(record)">编辑</a-button>
                                    <a-popconfirm placement="top" okText="确定" cancelText="取消"
                                                  @confirm="deleteDepartment.deleteOk(record)">
                                        <template slot="title">
                                            <p>是否删除该部门</p>
                                        </template>
                                        <a-button type="link">删除</a-button>
                                    </a-popconfirm>
                                </span>
                            </a-table>
                        </div>
                    </div>
                    <div class="user_item">
                        <div class="item_info_area">
                            <i class="iconfont iconchengyuanduoxuan"></i>
                            <span class="title_area">部门人员</span>
                            <a-button class="handle_btn" @click="addUser.show">添加成员</a-button>
                        </div>
                        <div class="item_table_area">
                            <a-table :columns="deptUser.userColumns"
                                     :rowKey="record => record.id"
                                     :dataSource="deptUser.userData"
                                     :bordered="true"
                                     :pagination="deptUser.userPagination"
                                     @change="deptUser.handleUserChange"
                                     :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '当前部门暂无成员'}"
                            >
                                <span slot="handle" slot-scope="record">
                                    <a-popconfirm placement="top" okText="确定" cancelText="取消"
                                                  @confirm="deleteUser.deleteOk(record)">
                                        <template slot="title">
                                            <p>是否删除该用户</p>
                                        </template>
                                        <a-button type="link">删除</a-button>
                                    </a-popconfirm>
                                </span>
                            </a-table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--   新增/编辑子部门    -->
        <a-drawer :title="isAdd?'新增子部门':'编辑子部门'"
                  :visible="editDepartmentVisible"
                  :width="600"
                  @close="cancelEditDepartment"
                  class="add_drawer"
        >
            <a-form-model :model="deptForm" :rules="deptFormRules" ref="deptForm"  :labelCol="{ span: 4 }" :wrapperCol="{ span: 16 }">
                <a-form-model-item prop="name" label="部门名称">
                    <a-input type="text" placeholder="请输入部门名称" v-model="deptForm.name"></a-input>
                </a-form-model-item>
                <a-form-model-item prop="departmentType" label="部门类型">
                    <a-radio-group button-style="solid" v-model="deptForm.departmentType">
                        <a-radio-button v-for="dptType in departmentType" :key="dptType.value" :value="dptType.value" :disabled="dptType.value== 'enterprise'">{{dptType.name}}
                        </a-radio-button>
                    </a-radio-group>
                </a-form-model-item>
                <a-form-model-item prop="sort" label="部门排序">
                    <a-input-number placeholder="请填写部门排序"
                                    style="width: 200px;"
                                    v-model="deptForm.sort"
                                    :min="1"
                    ></a-input-number>
                </a-form-model-item>
                <a-form-model-item prop="parentId" label="上级部门">
                    <a-tree-select style="width: 100%"
                                   :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                                   :tree-data="treeData"
                                   show-search
                                   allowClear
                                   placeholder="请选择上级部门"
                                   tree-default-expand-all
                                   :replaceFields="{value:'id',title:'title'}"
                                   v-model="deptForm.parentId"
                                   @select="addDepartment.changeParent"
                    >
                    </a-tree-select>
                </a-form-model-item>
            </a-form-model>
            <div class="handle_area">
                <a-button style="margin-right: 30px" @click="cancelEditDepartment">取消</a-button>
                <a-button type="primary" @click="handleEditOk" :loading="editLoading">保存</a-button>
            </div>
        </a-drawer>
        <!--   添加人员    -->
        <a-modal title="选择用户"
                 :visible="addUser.visiable"
                 :confirm-loading="addUser.confimLoading"
                 @ok="addUser.add"
                 @cancel="addUser.cancel"
        >
            <div class="add_user_search">
                <div class="search_label">已选择{{addUser.selectedRowKeys.length}}个</div>
                <a-input-search allowClear placeholder="搜索" v-model="addUser.name" style="width: 270px" @search="addUser.fetUserList"/>
            </div>
            <div class="table_area">
                <a-table :columns="addUser.addUserColums"
                         :rowKey="record => record.id"
                         :pagination="addUser.userListPagination"
                         :dataSource="addUser.userData"
                         :loading="addUser.userLoading"
                         :row-selection="{ selectedRowKeys: addUser.selectedRowKeys, onChange: addUser.onSelectChange }"
                         :bordered="true"
                         @change="addUser.handleTableChange"
                         :locale="{filterConfirm: '确定',filterReset: '重置',emptyText: '暂无数据'}"
                         size="small"
                >
                </a-table>
            </div>
        </a-modal>
    </div>
</template>

<script>

    const departmentColumns = [
        {
            title: '部门',
            dataIndex: 'name',
        },
        {
            title: '排序',
            dataIndex: 'sort',
            width: 80
        },
        {
            title: '部门类型',
            dataIndex: 'dict.name',
            width: 150
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'},
            width: 300,
        }
    ];
    const userColumns = [
        {
            title: '姓名',
            dataIndex: 'name',
        },
        {
            title: '角色',
            dataIndex: 'role.nickname',
        },
        {
            title: '手机',
            dataIndex: 'phone',

        },
        {
            title: '默认部门',
            dataIndex: 'department.name',

        },
        {
            title: '操作',
            key: 'handle',
            align: 'center',
            scopedSlots: {customRender: 'handle'},
            width: 200,
        }
    ];
    const addUserColums = [
        {
            title: '姓名',
            dataIndex: 'name',
            align: 'center'
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            align: 'center'
        },

    ];

    export default {
        name: "Department",
        data() {
            return {
                // 搜索关键词
                searchDeptName: '',
                // 树状图
                treeData: [],
                selectedKeys: [],
                expandedKeys: [],
                autoExpandParents: true,
                // 面包屑
                breadcrumbData: [],
                // 当前选中部门
                selectedDeptId: '',

                /* 下级部门相关功能  */
                departmentColumns,
                departmentData: [],
                infoArr: [],
                isAdd:true,
                editLoading:false,
                broSort:[],
                editDepartmentVisible:false,
                departmentType: [],
                defaultType: '',
                departmentTreeData: [],
                departmentReality: true,
                deptForm:{parentId:this.selectedDeptId},
                deptFormRules:{
                    name:[{ required: true, message: '请输入部门名称' },{max:20,message: '输入长度不超过20'}],
                    departmentType:[{required:true,message:'请选择部门类型'}],
                    sort:[{ required: true, message: '请填写部门排序' }]
                },
                // 新增
                addDepartment:{
                    show:()=>{
                        this.isAdd = true
                        this.editDepartmentVisible = true
                        this.deptForm = {parentId: this.selectedDeptId}
                        console.log(this.broSort)
                    },
                    add:()=>{
                        this.$refs.deptForm.validate(valid=>{
                            if(valid) {
                                const reqData = {
                                    ...this.deptForm,
                                    reality: true
                                }
                                if(!reqData.parentId) {
                                    delete reqData.parentId
                                }
                                console.log(this.broSort)
                                this.editLoading = false
                                if(this.broSort.indexOf(reqData.sort) !== -1) {
                                    this.$message.error('当前部门排序已存在，请修改',2)
                                    return false
                                }
                                this.broSort.push(reqData.sort)
                                this.$http.post('/framework/admin/department/add', reqData).then(res => {
                                    if (res.success) {
                                        this.$message.success('添加成功', 2)
                                        this.deptForm = {}
                                        this.editDepartmentVisible = false
                                        if(this.selectedDeptId) {
                                            this.getDepartmentList(this.selectedDeptId)
                                            this.deptUser.getData()
                                            this.breadcrumbData = this.getDepartmentPath(this.selectedDeptId)
                                            // this.selectedKeys = [this.selectedDeptId]
                                        }else {
                                            this.deptUser.userData = []
                                            this.breadcrumbData = []
                                            // this.selectedKeys = []
                                        }
                                        this.fetch()
                                    } else {
                                        this.$message.error(res.msg, 2)
                                    }
                                })
                            }
                        })
                    },
                    changeParent:(value,node)=>{
                        // console.log(node.dataRef)
                        if(node.dataRef.children) {
                            this.broSort = node.dataRef.children.map(item=>{return item.sort})
                        }
                        console.log(this.broSort)
                    }
                },
                // 编辑
                updateDepartment:{
                    reality: true,
                    deptSort:null,
                    show:(record)=>{
                        this.isAdd = false
                        this.editDepartmentVisible = true
                        this.deptForm = {...record}
                        this.updateDepartment.deptSort = record.sort
                        console.log(this.broSort)
                    },
                    update:()=>{
                        this.$refs.deptForm.validate(valid=>{
                            if(valid) {
                                const reqData = Object.assign({},this.deptForm)

                                if (!reqData.parentId){
                                    delete reqData.parentId
                                }
                                this.editLoading = false
                                if(this.broSort.indexOf(reqData.sort) !== -1 && reqData.sort !== this.updateDepartment.deptSort) {
                                    this.$message.error('当前部门排序已存在，请修改',2)
                                    return false
                                }
                                this.broSort.splice(this.broSort.indexOf(this.updateDepartment.deptSort),1)
                                this.broSort.push(reqData.sort)
                                this.$http.post('/framework/admin/department/update', reqData).then(res => {
                                    if (res.success) {
                                        this.$message.success('编辑成功', 2)
                                        this.deptForm = {}
                                        this.editDepartmentVisible = false
                                        if(this.selectedDeptId) {
                                            this.getDepartmentList(this.selectedDeptId)
                                            this.deptUser.getData()
                                            this.breadcrumbData = this.getDepartmentPath(this.selectedDeptId)
                                            // this.selectedKeys = [this.selectedDeptId]
                                        }else {
                                            this.deptUser.userData = []
                                            this.breadcrumbData = []
                                            // this.selectedKeys = []
                                        }
                                        this.fetch()
                                    } else {
                                        this.$message.error(res.msg, 2)
                                    }
                                })
                            }
                        })
                    },
                },
                // 删除
                deleteDepartment:{
                    deleteOk:(record)=>{
                        const ids = [record.id]
                        this.$http.post('/framework/admin/department/delete',ids).then(res=>{
                            if(res.success) {
                                this.$message.success('删除成功',2)
                                if(this.selectedDeptId) {
                                    this.getDepartmentList(this.selectedDeptId)
                                    this.deptUser.getData()
                                    this.breadcrumbData = this.getDepartmentPath(this.selectedDeptId)
                                    this.selectedKeys = [this.selectedDeptId]
                                }else {
                                    this.deptUser.userData = []
                                    this.breadcrumbData = []
                                    this.selectedKeys = []
                                }
                                this.fetch()
                            }else {
                                this.$message.error(res.msg+'，不能删除',2)
                            }
                        }).catch(res=>{
                            if(res.response.status === 500) {
                                this.$message.error(res.response.data.msg+'，不能删除',2)
                            }
                        })
                    }
                },

                /* 对应人员相关功能  */
                deptUser:{
                    userColumns,
                    userData: [],
                    userPagination:{
                        pageSize: 4,
                        current: 1,
                        total: 0
                    },
                    handleUserChange:(pagination)=>{
                        const pager = {...this.deptUser.userPagination};    //---防止对象引用复制---
                        pager.current = pagination.current;
                        this.deptUser.userPagination = pager;

                        this.deptUser.getData()
                    },
                    getData:()=>{
                        const data = {
                            size: this.deptUser.userPagination.pageSize,
                            page: this.deptUser.userPagination.current,
                            example: {departmentId:this.selectedDeptId}
                        }
                        this.$http.post('/framework/admin/user/department/list',data).then(res => {
                            if (res.success) {
                                const data = res.data;
                                const pagination = {...this.deptUser.userPagination};
                                pagination.total = data.total;
                                this.deptUser.userPagination = pagination;
                                this.deptUser.userData = data.result
                            }else {
                                this.$message.error(res.msg,2)
                            }
                        })
                    },
                },
                // 新增
                addUser:{
                    visible:false,
                    confimLoading:false,
                    addUserColums,
                    userData:[],
                    userListPagination:{
                        pageSize: 8,
                        current: 1,
                        total: 0
                    },
                    userLoading:false,
                    userIds:"",
                    selectedRowKeys:[],
                    name:'',
                    show:()=>{
                        if(this.selectedDeptId) {
                            this.addUser.fetUserList();
                            this.addUser.visible = true
                        }else {
                            this.$message.error('请选择要添加成员的部门',2)
                            return false
                        }
                    },
                    fetUserList:()=>{
                        var query = [
                            {
                                fieldName: 'name',
                                operator: 'LIKE',
                                value: this.addUser.name
                            }
                        ]
                        const data = {
                            size: this.addUser.userListPagination.pageSize,
                            page: this.addUser.userListPagination.current,
                            query,
                        };

                        this.$http.post('/framework/admin/user/list', data).then(res => {
                            if (res.success) {
                                const data = res.data;
                                const pagination = {...this.addUser.userListPagination};
                                pagination.total = data.total;
                                this.addUser.userLoading = false;
                                this.addUser.userData = data.result;
                                this.addUser.userListPagination = pagination;
                                this.addUser.visiable = true;
                            }

                        }).catch((error) => {
                            if (error) {
                                this.$message.error('系统错误', 2)
                                this.addUser.userLoading = false;
                            }
                        });
                    },
                    handleTableChange:(pagination, filters)=>{
                        const pager = {...this.addUser.userListPagination};    //---防止对象引用复制---
                        pager.current = pagination.current;
                        this.addUser.userListPagination = pager;
                        const result = {};
                        const filterKeys = Object.keys(filters);
                        for (let i = 0; i < filterKeys.length; i++) {
                            result[filterKeys[i]] = filters[filterKeys[i]][0];
                        }
                        this.addUser.fetUserList();
                    },
                    add:()=>{
                        let reqData = (this.addUser.selectedRowKeys).map(uid=>{
                            return {
                                userId:uid,
                                departmentId: this.selectedDeptId,
                            }
                        });
                        // console.log(reqData)
                        this.$http.post('/framework/admin/user/department/add', reqData).then(res => {
                            if (res.success) {
                                this.$message.success('添加成功', 2)
                                this.addUser.visiable = false
                                this.addUser.name = ''
                                this.addUser.selectedRowKeys = [this.selectedDeptId]
                                this.breadcrumbData = this.getDepartmentPath(this.selectedDeptId)
                                this.getDepartmentList(this.selectedDeptId)
                                this.deptUser.userPagination.current = 1
                                this.deptUser.getData()
                                this.fetch()
                            } else {
                                this.$message.error(res.msg, 2)
                            }
                        }).catch(function (error) {
                            if(error) {
                                this.$message.error('系统错误',2)
                            }
                        });
                    },
                    cancel:()=>{
                        this.addUser.visiable = false
                        this.addUser.name = ''
                        this.addUser.selectedRowKeys = []
                    },
                    onSelectChange:(selectedRowKeys)=> {
                        // console.log('selectedRowKeys changed: ', selectedRowKeys);
                        this.addUser.selectedRowKeys = selectedRowKeys;
                    },
                },
                // 删除
                deleteUser:{
                    deleteOk:(record)=> {
                        const data = {
                            userId: record.id,
                            departmentId: this.selectedDeptId
                        }
                        this.$http.post('/framework/admin/user/department/delete' ,data).then(res => {
                            if (res.success) {
                                this.$message.success('删除成功', 2)
                                this.breadcrumbData = this.getDepartmentPath(this.selectedDeptId)
                                this.getDepartmentList(this.selectedDeptId)
                                this.deptUser.userPagination.current = 1
                                this.deptUser.getData()
                                this.selectedKeys = [this.selectedDeptId]
                                this.fetch()
                            } else {
                                this.$message.error(res.msg, 2)
                            }
                        })
                    },
                },
            }
        },
        created() {
            this.fetch()
            this.fetchCombo()
        },
        mounted(){
            this.$on('tenantChange', ()=>{
                this.fetch()
                this.fetchCombo()
            })

        },
        methods: {
            // 获取页面数据
            async fetch() {
                await this.$http.get('/framework/admin/department/page').then(res => {
                    if (res.success) {
                        const data = res.data
                        if(data.length > 0) {
                            for (let i=0; i< data.length; i++){
                                let root = data[i]
                                root.slots = {icon:'parent'}
                                root.children = root.children ? this.fillSlot(root.children):[]
                            }
                            this.treeData = data
                            if(!this.selectedDeptId) {
                                this.expandedKeys = [data[0].id]
                            }
                        }
                    }
                })
            },
            // 获取部门类型
            fetchCombo() {
                this.$http.get('/framework/admin/department/type').then(res => {
                    if (res.success) {
                        this.departmentType = res.data
                        if (res.data.length > 0){
                            this.defaultType = res.data[0].name
                        }
                    }
                })
            },
            // 获取下级部门数据
            getDepartmentList(id) {
                this.$http.get('/framework/admin/department/children?id='+id).then(res=>{
                    if(res.success) {
                        this.departmentData = res.data
                    }else {
                        this.$message.error(res.msg,2)
                    }
                })
            },
            // 关键词搜索
            searchByDeptName() {
                // console.log(this.searchDeptName)
                this.$http.get('/framework/admin/department/search?keywords=' + this.searchDeptName).then(res => {
                    if (res.success) {
                        if(res.data.selectedKeys.length !== 0) {
                            this.expandedKeys = res.data.expandedKeys
                            this.selectedKeys = res.data.selectedKeys
                            this.getDepartmentList(res.data.selectedKeys[0])
                            // let list = this.getDepartmentList(res.data.selectedKeys[0]);
                            // let depList = []
                            // list.forEach(n => {
                            //     let ele = {
                            //         key: n.key,
                            //         title: n.title,
                            //         sort: n.sort ? n.sort : 0
                            //     }
                            //     depList.push(ele)
                            // })
                            // this.departmentData = depList
                            this.breadcrumbData = this.getDepartmentPath(this.selectedKeys[0])
                            this.selectedDeptId = res.data.selectedKeys[0]
                        }else {
                            this.$message.error('暂无相关部门',2)
                            this.searchDeptName = ''
                            return false
                        }
                        // this.changeSelectDept(res.data.selectedKeys,true)
                    }
                })
            },
            // 重置搜索
            resetSearch() {
                this.searchDeptName = ''
                this.selectedKeys = []
                this.departmentData = []
                this.breadcrumbData = []
                this.selectedDeptId = ''
                this.fetch()
            },
            // 给树形图设置图标
            fillSlot(data) {
                if(data) {
                    for(var i = 0; i < data.length; i++) {
                        data[i].slots = { icon : 'child'}
                        if(data[i].children) {
                            this.fillSlot(data[i].children)
                        }
                    }
                    return data
                }
            },
            // 选择树形图某一项
            changeSelectDept(keys, {selected,node}) {
                if(selected) {
                    const id = node.dataRef.id
                    const key = keys[0]
                    this.selectedKeys = keys
                    this.selectedDeptId = id
                    this.getDepartmentList(id)
                    this.deptUser.userPagination.current = 1
                    this.deptUser.getData()
                    if(node.dataRef.children) {
                        this.broSort = node.dataRef.children.map(item=>{return item.sort})
                    }else {
                        this.broSort = []
                    }
                    this.breadcrumbData = this.getDepartmentPath(key)
                }
            },
            // 展开树形图某一项
            onExpand(keys) {
                this.expandedKeys = keys;
            },
            // 获取面包屑数据
            getDepartmentPath(key) {
                let paths = []
                for (let i = 0; i < this.treeData.length; i++) {
                    paths = []
                    let node = this.treeData[i]
                    let res = this.pushPath(key, node, paths)
                    if (res === true){
                        return paths
                    }
                }
            },
            pushPath(key, node, paths) {
                if (node.id === key) {
                    paths.push(node.title)
                    return true
                } else {
                    if (node.children) {
                        paths.push(node.title)
                        for (let i = 0; i < node.children.length; i++) {
                            let child = node.children[i]
                            let res = this.pushPath(key, child, paths)
                            if (res === true) {
                                return true
                            }
                        }
                        paths.pop()
                    }
                }
            },
            getBros(id) {
                let bros = []
                for(var i = 0; i < this.treeData.length; i++) {
                    bros = []
                    let node = this.treeData[i]
                    let res = this.getChildren(id,node,bros)
                    if(res == true) {
                        return bros
                    }
                }
            },
            getChildren(id,data,bros) {
                if(data.id == id) {
                    bros = data.children?data.children:[]
                    return true
                } else {
                    if(data.children) {
                        for (let i = 0; i < data.children.length; i++) {
                            let child = data.children[i]
                            let res = this.getChildren(id,child,bros)
                            if(res == true) {
                                return  true
                            }
                        }
                    }
                }
            },



            // 确认新增/编辑子部门
            handleEditOk() {
                this.editLoading = true
                if(this.isAdd) {
                    this.addDepartment.add()
                }else {
                    this.updateDepartment.update()
                }
            },
            // 取消新增/编辑子部门
            cancelEditDepartment() {
                this.editDepartmentVisible = false
                this.deptForm = {}
                this.$refs.deptForm.resetFields()
            },

            repairInfo(){
                this.$http.get('/framework/admin/department/treenode/repair').then(res => {
                    if (res.success) {
                        this.$message.success("修复成功")
                    }
                })
            }

        },
    }
</script>

<style lang="scss" scoped>
    @font-face {
        font-family: "iconfont"; /* Project id 1904975 */
        src: url('../../assets/fonts/Department.woff2?t=1630996903930') format('woff2'),
        url('../../assets/fonts/Department.woff?t=1630996903930') format('woff'),
        url('../../assets/fonts/Department.ttf?t=1630996903930') format('truetype');
    }

    .iconfont {
        font-family: "iconfont" !important;
        font-size: 16px;
        font-style: normal;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    .iconchengyuanduoxuan:before {
        content: "\e645";
    }

    .iconzuzhijiagou:before {
        content: "\e6ef";
    }

    /deep/ .ant-table-tbody > tr > td {
        padding: 4px 8px !important;
        font-size: 12px;
    }

    /deep/ .ant-table-body {
        margin: 0 !important;
    }

    /deep/ .ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
        background-color: #357ef7;
        color: #fff;
    }
    /deep/ .ant-tree li .ant-tree-node-content-wrapper {
        width: 90%;
        height: 30px;
        line-height: 30px;
        vertical-align: middle;
    }
    /deep/ .ant-tree li span.ant-tree-iconEle {
        line-height: 30px;
    }

    .ant-table-wrapper {
        .ant-table-content {
            background: white;
        }
    }

    .ant-table td {
        white-space: nowrap;
        font-size: 12px !important;
    }

    /deep/ .ant-table-thead {
        background: #F8F9FB;
    }

    /deep/ .ant-table-thead > tr > th {
        min-width: 130px !important;
        padding: 10px 10px !important;
    }

    .hide-info-class {
        display: none;
    }

    .ant-radio-button-wrapper {
        margin: 0 10px 0 0;
        border-radius: 0 !important;
        height: 30px;
        font-size: 14px;
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

    .ant-table-wrapper {
        .ant-table-content {
            background: white;
        }
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
        margin-top:16px;
        background: #ffffff;
        min-height:625px;
        padding: 0 20px;

        .top_title {
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

        .bot_info {
            margin-top: 15px;
            width: 100%;
            display: flex;
            justify-content: space-between;

            .left_tree {
                width: 332px;
                height: 538px;
                background: #f8f9fb;
                margin-right: 60px;
                overflow-y: auto;
                &::-webkit-scrollbar {
                    width: 10px;
                }
                &::-webkit-scrollbar-track-piece {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                &::-webkit-scrollbar-thumb {
                    background: #dbe3ee;
                    border-radius: 10px;
                }
                /*overflow-x:hidden;*/
            }
            /*.left_tree::-webkit-scrollbar {*/
            /*    width: 10px;*/
            /*    background: #eeeeee;*/
            /*}*/



            .right_table {
                flex: 1;

                .department_item,.user_item {
                    margin-top: 20px;

                    .item_info_area {
                        display: flex;
                        align-items: center;

                        .iconfont {
                            font-size: 24px;
                            margin-right: 10px;
                            color: #357ef7;
                        }

                        .title_area {
                            font-size: 18px;
                            color: #347DF7;
                            font-weight: bold;
                            margin-right: 40px;
                        }

                        .handle_btn {
                            border-color: #347DF7;
                            color: #347DF7;
                            font-size: 14px;
                            padding: 0 10px;
                            border-radius: 20px;
                        }
                    }

                    .item_table_area {
                        margin-top: 10px;
                    }
                }
            }
        }
    }

    .add_drawer {
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

    .add_user_search {
        width: 100%;
        height: 35px;
        display: flex;
        margin: 0 auto 20px;

        .search_label {
            font-size: 15px;
            line-height: 35px;
            font-weight: bold;
            margin: 0 50px 0 20px;
        }
    }
</style>