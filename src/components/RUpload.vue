<template>
    <div v-if="!single">
        <a-upload
                name="file"
                :action="uploadAction"
                listType="picture-card"
                :fileList="imgUploadfileList"
                :remove="handleImgUploadRemove"
                @change="handleFileListChange"
                @preview="handleImgUploadPreview"
        >
            <a-button>
                <a-icon type="upload" /> 上传图片
            </a-button>
            <a-modal :visible="imgUploadPreviewVisible" :footer="null" @cancel="imgUploadHandleCancel">
                <img alt="example" style="width: 100%" :src="imgUploadPreviewImage" />
            </a-modal>
        </a-upload>
    </div>
    <div v-else>
        <a-upload
                name="file"
                listType="picture-card"
                class="avatar-uploader"
                :showUploadList="false"
                :action="uploadAction"
                :fileList="imgUploadfileList"
                @change="handleFileListChange"
        >
            <div>
                <div v-if="value">
                    <div style="position: relative;" v-if="file">
                        <a-icon :type="imUploadLoading ? 'loading' : 'file-text'" style="font-size: 36px"/>
                        <div class="r-upload-close" @click.stop="deleteFile()">
                            <a-icon type="close" />
                        </div>
                    </div>
                    <div style="position: relative;" v-else>
                        <img v-if="value" :src="value" alt="avatar"  style="display: block; width: 100%"/>
                        <div class="r-upload-close" @click.stop="deleteImg()">
                            <a-icon type="close" />
                        </div>
                    </div>
                </div>
                <div v-else>
                    <a-icon :type="imUploadLoading ? 'loading' : 'plus'"/>
                    <div class="ant-upload-text">上传</div>
                </div>
            </div>
        </a-upload>

    </div>
</template>

<script>

    export default {
        name: 'RUpload',
        data(){
            return {
                uploadAction:"/framework/boot/file/upload",
                imgUploadfileList: [],
                newFileList: [],

                imgUploadPreviewVisible: false,
                imgUploadPreviewImage: '',
                imUploadLoading: false,
                dataValue: this.value
            }
        },
        mounted(){
            if (!this.single){
                if (this.dataValue instanceof Array){
                    this.imgUploadfileList = this.dataValue.map((v, index)=>{
                        return {
                            uid: index + 1,
                            status: 'done',
                            url: v,
                            name: (index + 1) + '.png'
                        }
                    })
                }
            }
        },
        watch:{
            value(val){
                if (val instanceof Array){
                    this.imgUploadfileList = val.map((v, index)=>{
                        return {
                            uid: index + 1,
                            status: 'done',
                            url: v,
                            name: (index + 1) + '.png'
                        }
                    })
                }
            }
        },
        props:{
            value:{
                type:[Array, String],
                required:true
            },
            single:{
                type: Boolean,
                required: false,
                default: false
            },
            file:{
                type: Boolean,
                required: false,
                default: false
            }
        },
        methods:{
            handleFileListChange(info) {
                this.imgUploadfileList = info.fileList;

                if (this.single){
                    if(info.file.status==='done'){
                        this.imUploadLoading = false;
                        this.dataValue = info.file.url || info.file.response.url
                        this.$emit('change', info.file.url || info.file.response.url)
                    }else if (info.file.status === 'uploading'){
                        this.imUploadLoading = true;
                    }
                }else {
                    if(info.file.status==='done'){
                        let fileList = info.fileList;

                        let urls = [];
                        fileList.forEach(file => {
                            urls.push(file.url || file.response.url)
                        });
                        this.dataValue = urls

                        this.$emit('change', urls);

                    }
                }

            },

            handleImgUploadPreview(file){
                this.imgUploadPreviewImage = file.url || file.response.url;
                this.imgUploadPreviewVisible = true;
            },

            imgUploadHandleCancel(){
                this.imgUploadPreviewVisible = false;
            },

            handleImgUploadRemove(file){
                const index = this.imgUploadfileList.indexOf(file);
                const tmpList = this.imgUploadfileList.slice();
                tmpList.splice(index, 1);
                this.imgUploadfileList = tmpList;


                let urls = [];
                tmpList.forEach(file => {
                    urls.push(file.url || file.response.url)
                });

                this.$emit('change', urls);

                this.$emit('change', this.newFileList);

            },

            deleteImg(){
                if (this.single){
                    this.dataValue = '';

                    this.$emit('change', '');
                }
            },

            deleteFile(){
                if (this.single){
                    this.dataValue = '';

                    this.$emit('change', '');
                }
            }
        },
        model: {
            prop: 'value',
            event: 'change'
        }
    }
</script>

<style scoped>
.r-upload-close{
    position: absolute;
    right: -10px;
    top: -10px;
    color: white;
    background-color: red;
    border-radius: 10px;
    height: 20px;
    width: 20px;
}
</style>