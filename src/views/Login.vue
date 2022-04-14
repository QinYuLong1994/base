<template>
    <div class="container">
        <div class="top">
            <div class="header">
                <a :href="baseUrl">
                    <img src="../assets/logo.png" alt="" class="logo">
                    <span class="title">EWS Design</span>
                </a>
            </div>
            <div class="desc">EWS后台管理系统</div>
        </div>
        <div class="main">
            <a-form>
                <a-form-item>
                    <a-input size="large" type="text" v-model="formLogin.username"
                             placeholder="用户名">
                        <a-icon slot="prefix" type='user' :style="{ color: 'rgba(0,0,0,.25)' }"/>
                    </a-input>
                </a-form-item>
                <a-form-item>
                    <a-input size="large" type="password" v-model="formLogin.password"
                             placeholder="密码">
                        <a-icon slot="prefix" type='lock' :style="{ color: 'rgba(0,0,0,.25)' }"/>
                    </a-input>
                </a-form-item>

                <a-form-item>
                    <a-checkbox v-model="formLogin.rememberMe">自动登陆</a-checkbox>
                    <router-link :to="{ name: 'recover' }" class="forget-password">
                        忘记密码
                    </router-link>
                </a-form-item>

                <a-form-item>
                    <a-button
                            size="large"
                            type="primary"
                            htmlType="submit"
                            class="login-button"
                            :loading="loginBtn"
                            @click.stop.prevent="handleSubmit"
                            :disabled="loginBtn">确定
                    </a-button>
                </a-form-item>
            </a-form>
        </div>
        <div class="footer">
            <div class="copyright">Copyright &copy; 2021 后台开发组出品</div>
        </div>
    </div>
</template>

<script>

    export default{
        data(){
            return{
                formLogin:{
                    username: '',
                    password: '',
                    rememberMe: false
                },
                loginBtn: false,

                baseUrl: '/backend'
            }
        },
        methods:{
            handleSubmit(){
                //---如果含有用户名和密码，则把认证信息清空，然后重新登录---
                if (localStorage.hasOwnProperty(this.$store.state.TOKEN_NAME)) {
                    this.$store.commit('setRouted', false);
                    this.$store.commit('setNav', '');
                    this.$store.commit('setMenuKey', '');
                    this.$store.commit('setOpenKey', '');

                    localStorage.removeItem(this.$store.state.TOKEN_NAME);

                    if (localStorage.hasOwnProperty(this.$store.state.EXPIRE_NAME)){
                        localStorage.removeItem(this.$store.state.EXPIRE_NAME);
                    }

                }

                this.loginBtn = true;
                
                const data = {
                    _username: this.formLogin.username,
                    _password: this.formLogin.password
                };

                const that = this;
                this.$http.post('/framework/boot/user/login', data).then(function (res) {
                    if (res.success){
                        let expire = new Date().getTime() + 1000 * 60 * 60 * 20;
                        localStorage.setItem(that.$store.state.EXPIRE_NAME, expire);
                        localStorage.setItem(that.$store.state.TOKEN_NAME, res.data);

                        that.$store.commit('setMenuKey', '1');       //---默认打开menukey=1的菜单---

                        that.$router.replace({name: 'home'}, ()=>{}, ()=>{});

                        that.$store.dispatch('initUserinfo');

                    }else {
                        that.formLogin.username = '';
                        that.formLogin.password = '';

                        that.$message.error(res.msg, 2);
                    }
                    that.loginBtn = false;
                });
            }
        }
    }

</script>

<style lang="scss" scoped>
    .container{
        width: 100%;
        min-height: 100%;
        background: #f0f2f5 url("../assets/background.svg") no-repeat 50%;
        background-size: 100%;
        padding: 110px 0 144px;
        position: relative;

        a {
            text-decoration: none;
        }

        .top {
            text-align: center;

            .header{
                height: 44px;
                line-height: 44px;

                .logo{
                    height: 44px;
                    vertical-align: top;
                    margin-right: 16px;
                    border-style: none;
                }

                .title{
                    font-size: 33px;
                    color: rgba(0, 0, 0, 0.85);
                    font-family: "Myriad Pro", "Helvetica Neue", Arial, Helvetica, sans-serif;
                    font-weight: 600;
                    position: relative;
                    top: 2px;
                }
            }

            .desc{
                font-size: 14px;
                color: rgba(0, 0, 0, 0.45);
                margin-top: 12px;
                margin-bottom: 40px;
            }
        }

        .main{
            width: 368px;
            margin: 60px auto;

            .forget-password{
                font-size: 14px;
                float: right;
            }

            .login-button{
                padding: 0 15px;
                font-size: 16px;
                height: 40px;
                width: 100%;
            }
        }

        .footer{
            position: absolute;
            bottom: 0;
            width: 100%;
            margin: 48px 0 24px;
            text-align: center;

            .copyright{
                color: rgba(0, 0, 0, 0.45);
                font-size: 14px;
            }
        }
    }
</style>