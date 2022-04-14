<template>
    <a-layout id="main-layout" style="height: 100%">
        <a-layout-sider
                :trigger="null"
                collapsible
                width="256"
                theme="light"
                :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }"
                v-model="collapsed">

            <div class="logo" >
                <router-link :to="{name:'home'}">
                    <img src="~@/assets/logo.png" alt="logo">
                    <h1>EWS后台管理系统</h1>
                </router-link>
            </div>

            <a-menu theme="light" mode="inline" :defaultSelectedKeys="[menuKey]" :defaultOpenKeys="[openKey]">
                <a-menu-item v-for="menu in leafMenu" :key="menu.key" @click="clickMenu(menu.path)">
                    <a-icon :type="menu.icon" />
                    <span>{{ menu.title}}</span>
                </a-menu-item>
                <a-sub-menu v-for="sub in subMenu" :key="sub.key">
                    <span slot="title">
                        <a-icon :type="sub.icon" />
                        <span>{{ sub.title}}</span>
                    </span>
                    <a-menu-item v-for="child in subChildren(sub.children)" :key="child.key" @click="clickMenu(child.path)">
                        <a-icon :type="child.icon" />
                        <span>{{ child.title}}</span>
                    </a-menu-item>
                </a-sub-menu>
            </a-menu>

        </a-layout-sider>

        <a-layout :style="{ marginLeft: siderWidth }">

            <a-layout-header style="background: #fff; padding: 0; display: flex; justify-content: space-between">

                <a-icon class="trigger"
                        :type="collapsed ? 'menu-unfold' : 'menu-fold'"
                        @click='()=>collapsed = !collapsed'
                />

                <a-dropdown style="margin-right: 16px; cursor: pointer">
                    <span class="ant-dropdown-link">
                        <a-avatar icon="user"/>
                        <span style="padding: 5px 12px;">{{ username }}</span>
                    </span>

                    <a-menu slot="overlay">
                        <a-menu-item key="0">
                            <a-icon type="user"/>
                            <span>个人中心</span>
                        </a-menu-item>
                        <a-menu-item key="1" @click="editPwd.show">
                          <a-icon type="form" />修改密码
                        </a-menu-item>
                        <a-menu-item key="2" v-if="tenant.enable && tenant.env === 'ADMIN'" @click="tenant.show">
                            <a-icon type="form"/>
                            设置虚拟环境
                        </a-menu-item>
                        <a-menu-divider/>
                        <a-menu-item key="3">
                            <a href="javascript:;" @click="handleLogout">
                                <a-icon type="logout"/>
                                <span style="padding: 5px 12px;">退出登录</span>
                            </a>
                        </a-menu-item>
                    </a-menu>

                </a-dropdown>

            </a-layout-header>

            <a-layout-content class="main-content">

                <router-view ref="child"/>

            </a-layout-content>



        </a-layout>

        <a-modal
                title="设置租户虚拟环境"
                v-model="tenant.visible"
                @ok="tenant.ok()"
                @cancel="tenant.cancel()"
        >
            <a-form :labelCol="{ span: 5 }" :wrapperCol="{ span: 16, offset: 1 }">
                <a-form-item label='选择租户' required>
                    <a-select placeholder="选择租户"  :allowClear="true" v-model="tenant.form.host">
                        <a-select-option v-for="item in tenant.tenantList" :key="item.host">{{ item.name}}</a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>
        <a-modal
          title="修改密码"
          v-model="editPwd.visible"
          okText="修改"
          cancelText="取消"
          :confirm-loading="editPwd.loading"
          @ok="editPwd.save"
          @cancel="editPwd.visible=false"
        >
          <a-form-model  
            ref="ruleForm"
            :labelCol="{ span: 4 }" 
            :wrapperCol="{ span: 16, offset: 1 }"
            :model="editPwd.form" 
            :rules="editPwd.rules"
          >
            <a-form-model-item label="当前密码" prop="currentPassword">
              <a-input-password placeholder="请输入当前密码" v-model="editPwd.form.currentPassword" />
            </a-form-model-item>
            <a-form-model-item label="新密码" prop="newPassword">
              <a-input-password placeholder="请输入新密码" v-model="editPwd.form.newPassword" />
            </a-form-model-item>
            <a-form-model-item label="确认密码" prop="confirmPassword">
              <a-input-password placeholder="请输入确认密码" v-model="editPwd.form.confirmPassword" />
            </a-form-model-item>
            
          </a-form-model>
        </a-modal>

    </a-layout>
</template>

<script>

    export default {
        data(){
            return {
                collapsed: false,

                menus: [],

                nav: JSON.parse(JSON.stringify(this.$store.state.nav)),

                menuKey: this.$store.state.menuKey,

                openKey: this.$store.state.openKey,

                tenant: {
                    enable: this.$store.state.tenant,
                    mode: this.$store.state.tenantMode,
                    env: this.$store.state.tenantEnv,

                    visible: false,
                    loading: false,
                    form: {},
                    tenantList: [],
                    show: () =>{
                        this.tenant.visible = true
                        this.tenant.fetchTenant()
                        if (this.$store.state.tenantHost){
                            this.tenant.form = {
                                host: this.$store.state.tenantHost
                            }
                        }
                    },
                    cancel: ()=>{
                        this.tenant.visible = false
                    },
                    ok: () => {
                        if (this.tenant.form.host){
                            this.$store.state.tenantHost = this.tenant.form.host
                        }else {
                            this.$store.state.tenantHost = ''
                        }
                        this.tenant.visible = false
                        this.$refs.child.$emit('tenantChange')
                        if (this.tenant.mode === 'SCHEMA'){
                            this.computeMenu()
                            this.$router.replace({name: 'home'}, ()=>{}, ()=>{});
                        }
                    },
                    fetchTenant: () => {
                        if (this.tenant.mode === 'SCHEMA'){
                            this.$store.state.tenant = false
                            this.$http.get('/framework/admin/sysTenant/combo').then(res => {
                                if (res.success){
                                    this.tenant.tenantList = res.data
                                    this.$store.state.tenant = true
                                }
                            }).catch(()=>{
                                this.$store.state.tenant = true
                            });
                        }else {
                            this.$http.get('/framework/admin/sysTenant/combo').then(res => {
                                if (res.success){
                                    this.tenant.tenantList = res.data
                                }
                            });
                        }
                    },
                },

                role: this.$store.state.userinfo.role,
                editPwd: {
                  visible: false,
                  loading: false,
                  form: {},
                  rules: {
                    currentPassword: [
                      {required: true, message:'请输入当前密码', trigger: 'blur'},
                      
                    ],
                    newPassword: [
                      {required: true, message:'请输入当前密码', trigger: 'blur'},
                      {validator: this.validatorNew}
                    ],
                    confirmPassword: [
                      {required: true, message:'请输入当前密码', trigger: 'blur'},
                      {validator: this.validatorConfirm}
                    ]
                  },
                  /**
                   * @description show
                   */
                  show: () => {
                    this.editPwd.form = {}
                    this.editPwd.visible = true
                  },
                  
                  /**
                   * @description save
                   */
                  save: () => {
                    let checkRes = true
                    this.$refs.ruleForm.validate(valid => {
                      if (!valid) {
                        checkRes = false;
                      }
                    });
                    if(!checkRes){
                      return false
                    }
                    this.editPwd.loading = true
                    this.$http.post('/user/update_password', this.editPwd.form).then(res => {
                      if (res.success) {
                        this.editPwd.loading = false
                        this.$message.success('修改成功，请重新登录', 2);
                        this.editPwd.visible = false
                        this.handleLogout();
                      } else {
                        this.editPwd.loading = false
                        this.$message.error(res.msg, 2);
                        return;
                      }
                    })
                  }
                }

            }
        },
        mounted(){
            if (this.tenant.mode === 'DISCRIMINATOR'){
                this.menus = this.nav
            }else if (this.tenant.mode === 'SCHEMA'){
                this.computeMenu()
            }else {
                this.menus = this.nav
            }
        },
        computed:{
            siderWidth(){
                if (this.collapsed){
                    return '80px'
                }else{
                    return '256px'
                }
            },
            leafMenu(){
                return this.menus.filter(function (item) {
                    if (item.hidden === undefined){
                        return item.leaf
                    }else {
                        return item.leaf && !item.hidden;
                    }

                })
            },
            subMenu(){
                return this.menus.filter(function (item) {
                    return !item.leaf && !item.hidden && item.children.length > 0;
                })
            },
            username(){
                return this.$store.state.userinfo.username;
            }
        },
        methods:{
          validatorNew(rule, value, callback) {
                    if (value.length < 6) {
                      callback('密码长度至少为6位！')
                    }
                    callback()
                  },
                  validatorConfirm(rule, value, callback) {
                    if (value !== this.editPwd.form.getFieldValue('newPassword')) {
                      callback('两次密码输入不一致！')
                    }
                    callback()
                  },
            subChildren(children){
                return children.filter(function (item) {
                    return !item.hidden
                })
            },
            handleLogout(){

                this.$store.commit('setRouted', false);
                this.$store.commit('setNav', '');
                this.$store.commit('setMenuKey', '');
                this.$store.commit('setOpenKey', '');

                this.$store.state.tenantHost = '';


                this.$router.replace({name:'login'});


                localStorage.removeItem(this.$store.state.TOKEN_NAME);
                localStorage.removeItem(this.$store.state.EXPIRE_NAME);

            },
            clickMenu(path){
                let route = this.$route;
                if (route.path !== path){
                    this.$router.push(path)
                }
            },
            computeMenu() {
                if (this.tenant.env === 'ADMIN'){
                    let nav = JSON.parse(JSON.stringify(this.nav))
                    let parent = nav.find(item=>{
                        return item.key === 'initMenu'
                    })
                    let nullHost = parent.children.find(item=>{
                        return item.key === 'Tenant'
                    })
                    let hostMenu = parent.children.filter(item=>{
                        return item.key !== 'Tenant'
                    })
                    let value = this.$store.state.tenantHost
                    if(value) {
                        parent.children = hostMenu
                        this.menus = nav
                    }else {
                        parent.children = [nullHost]
                        this.menus = nav
                    }
                }else {
                    this.menus = this.nav
                }

            }
        }
    }
</script>

<style lang="scss" scoped>
    #main-layout{
        .logo{
            height: 64px;
            background: #e4ecf8;
            overflow: hidden;
            line-height: 64px;
            padding-left: 24px;

            img{
                display: inline-block;
                vertical-align: middle;
                height: 32px;
            }

            h1{
                display: inline-block;
                color: #333333;
                font-size: 20px;
                margin: 0 0 0 12px;
                font-family: Chinese Quote,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;
                font-weight: 600;
            }
        }

        .trigger{
            font-size: 18px;
            line-height: 64px;
            padding: 0 24px;
            cursor: pointer;
            transition: color .3s;
        }

        .trigger:hover{
            color: #1890ff;
        }

        .main-content{
            padding: 1rem;
            overflow-y: scroll;
        }
    }
</style>
