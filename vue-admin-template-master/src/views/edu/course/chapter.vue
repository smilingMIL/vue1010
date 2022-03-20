<template>
  <div class="app-container">
    <h2 style="text-align: center;">发布新课程</h2>

    <el-steps :active="2" process-status="wait" align-center style="margin-bottom: 40px;">
      <el-step title="填写课程基本信息"/>
      <el-step title="创建课程大纲"/>
      <el-step title="最终发布"/>
    </el-steps>



<el-button type="text" @click="openChapterDialog()">添加章节</el-button>
<!-- 章节 -->
<ul class="chanpterList">
    <li
        v-for="chapter in chapterVideoList"
        :key="chapter.id">
        <p>
            {{ chapter.title }}
            <span class="acts">
                <el-button type="text" @click="openVideo(chapter.id)">添加小节</el-button>
                <el-button style="" type="text" @click="openEditChapter(chapter.id)">编辑</el-button>
                <el-button type="text" @click="deleteChapter(chapter.id)">删除</el-button>
            </span>
        </p>
        <!-- 视频 -->
        <ul class="chanpterList videoList">
            <li
                v-for="video in chapter.children"
                :key="video.id">
                <p>{{ video.title }}

                  <span class="acts">
                      <el-button style="" type="text" @click="openEditVideo(video.id)">编辑</el-button>
                      <el-button type="text" @click="deleteVideo(video.id)">删除</el-button>
                  </span>

                </p>
            </li>
        </ul>
    </li>
</ul>
<div id="xxx">
    <el-button @click="previous">上一步</el-button>
    <el-button :disabled="saveBtnDisabled" type="primary" @click="next">下一步</el-button>
</div>

    <!-- 添加和修改章节表单 -->
    <el-dialog :visible.sync="dialogChapterFormVisible" title="添加章节">
        <el-form :model="chapter" label-width="120px">
            <el-form-item label="章节标题">
                <el-input v-model="chapter.title"/>
            </el-form-item>
            <el-form-item label="章节排序">
                <el-input-number v-model="chapter.sort" :min="0" controls-position="right"/>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogChapterFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveOrUpdate">确 定</el-button>
        </div>
    </el-dialog>


    <!-- 添加和修改小节表单 -->
    <el-dialog :visible.sync="dialogVideoFormVisible" title="添加课时">
      <el-form :model="video" label-width="120px">
        <el-form-item label="课时标题">
          <el-input v-model="video.title"/>
        </el-form-item>
        <el-form-item label="课时排序">
          <el-input-number v-model="video.sort" :min="0" controls-position="right"/>
        </el-form-item>
        <el-form-item label="是否免费">
          <el-radio-group v-model="video.free">
            <el-radio :label="true">免费</el-radio>
            <el-radio :label="false">默认</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="上传视频">
                <el-upload
                      :on-success="handleVodUploadSuccess"
                      :on-remove="handleVodRemove"
                      :before-remove="beforeVodRemove"
                      :on-exceed="handleUploadExceed"
                      :file-list="fileList"
                      :action="BASE_API+'/eduvod/video/uploadAlyVideo'"
                      :limit="1"
                      class="upload-demo">
                  <el-button size="small" type="primary">上传视频</el-button>
                  <el-tooltip placement="right-end">
                      <div slot="content">最大支持10MB，<br>
                        支持3GP、ASF、AVI、DAT、DV、FLV、F4V、<br>
                        GIF、M2T、M4V、MJ2、MJPEG、MKV、MOV、MP4、<br>
                        MPE、MPG、MPEG、MTS、OGG、QT、RM、RMVB、<br>
                        SWF、TS、VOB、WMV、WEBM 等视频格式上传</div>
                      <i class="el-icon-question"/>
                  </el-tooltip>
                </el-upload>
      </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVideoFormVisible = false">取 消</el-button>
        <el-button :disabled="saveVideoBtnDisabled" type="primary" @click="saveOrUpdateVideo">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>


<script>

import chapterApi from '@/api/edu/chapter'
import videoApi from '@/api/edu/video'


export default {

  data() {
    return {
      saveBtnDisabled: false, // 保存按钮是否禁用
      chapterVideoList:[],
      courseId:"",  // 课程id
      dialogChapterFormVisible: false, //章节弹框默认值
      dialogVideoFormVisible: false,  //小节弹框默认值
      chapter:{
        title: '',
        sort: 0
      }, //用于封装章节数据
      video: {
        id: '',
        title: '',
        sort: 0,
        free: 0,
        videoSourceId: '',    // 上传视频id
        videoOriginalName: "",// 上传视频名称
      }, //用于封装小节数据
      BASE_API: process.env.BASE_API, // 接口API地址
      fileList: [],//上传文件列表
    }
  },
  created() {

      // 获取路由路径的id值
      if (this.$route.params && this.$route.params.id) {
          this.courseId = this.$route.params.id
          // 调用 - 根据课程id获取章节和小节数据
          this.getAllChapterVideo()
      }
      
  },
  methods: {

        // 点击确定调用这个方法
        handleVodRemove() {
            // 调用接口删除视频的方法
            videoApi.deleteAlyVideo(this.video.videoSourceId)
                .then(response => {
                    // 提示信息
                    this.$message({
                    type: 'success',
                    message: '删除视频成功!'
                    });
                    // 把文件列表清空
                    this.fileList = []
                    // 返回的视频id 封装到对象中 
                    this.video.videoSourceId = ''
                    // 上传视频名称赋值
                    this.video.videoOriginalName = ''
                })
        },
        
        // 点击 × 调用这个方法
        beforeVodRemove(file, fileList) {
            return this.$confirm(`确定移除 ${ file.name }?`)
        },

        // 上传视频成功调用的方法
        handleVodUploadSuccess(response, file, fileList) {
            
            // 返回的视频id 封装到对象中 
            this.video.videoSourceId = response.data.videoId
            // 上传视频名称赋值
            this.video.videoOriginalName = file.name
            // 提示信息
                    this.$message({
                    type: 'success',
                    message: '上传视频成功!'
                    });
        },

        // 上传之前的方法
        handleUploadExceed() {
            this.$message.warning('想要重新上传视频，请先删除已上传的视频')
        },

    //=============================================下面是小节部分======================================================

      // 删除小节
      deleteVideo(id) {
            this.$confirm('此操作将永久删除小节记录, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => { // 点击确定

            // 调用删除方法
            videoApi.deleteVideo(id)
            .then(response => { //删除成功
                // 提示信息
                this.$message({
                    type: 'success',
                    message: '删除小节成功!'
                    });
                // 刷新信息
                this.getAllChapterVideo()
            })

        }).catch(() => { // 点击取消

          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        })
      },

      // 添加小节弹框的方法
      openVideo(chapterId) {
          // 弹框
          this.dialogVideoFormVisible = true

          // 清空弹框的信息
          this.video.id = ''
          this.video.title = ""
          this.video.sort = 0
          this.video.free = 0
          this.video.videoSourceId = ""
          this.fileList = []

          //设置章节id
          this.video.chapterId = chapterId
      },


      // 打开修改弹窗做数据回显
      openEditVideo(id) {
          // 弹框
        this.dialogVideoFormVisible = true
        // 调用接口
        videoApi.getVideo(id)
            .then(response => {
              this.video = response.data.video
              this.fileList = [{'name': this.video.videoOriginalName}]
            })
      },



      // 添加小节
      addVideo() {
        // 设置课程id
        this.video.courseId = this.courseId
        videoApi.addVideo(this.video)
            .then(response => {
              // 关闭弹框
              this.dialogVideoFormVisible = false
               // 提示信息
                this.$message({
                    type: 'success',
                    message: '添加小节成功!'
                    });
                // 刷新信息
                this.getAllChapterVideo()
            })
      },


      // 修改小节
      updateVideo() {
          videoApi.updateVideo(this.video)
              .then(response => {
                   // 关闭弹框
                this.dialogVideoFormVisible=false

                // 提示信息
                this.$message({
                        type: 'success',
                        message: '修改小节成功!'
                    })

                // 刷新页面
                this.getAllChapterVideo()
              })
      },


      // 
      saveOrUpdateVideo() {

        //判断是否有id 有就是修改 
        if(!this.video.id){
          this.addVideo()
        } else {
          this.updateVideo()
        }
          
      },



    //=============================================下面是章节部分======================================================

    // 删除章节
    deleteChapter(chapterId) {
       this.$confirm('此操作将永久删除章节记录, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => { // 点击确定

            // 调用删除方法
            chapterApi.deleteChapter(chapterId)
            .then(response => { //删除成功
                // 提示信息
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                    });
                // 刷新信息
                this.getAllChapterVideo()
            })

        }).catch(() => { // 点击取消

          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        })
    },

    // 修改章节弹框数据回显
    openEditChapter(chapterId) {
        // 弹框
        this.dialogChapterFormVisible = true
        // 调用接口
        chapterApi.getChapter(chapterId)
            .then(response => {
              this.chapter = response.data.chapter
            })
    },

    // 弹出添加章节页面
    openChapterDialog() {
        // 弹框
        this.dialogChapterFormVisible = true
        // 清空表单数据
        this.chapter.title = ""
        this.chapter.sort = 0
    },

    // 添加章节
    addChapter() {
          // 设置课程id到chapter对象中
        this.chapter.courseId = this.courseId;
        // 调用添加方法
        chapterApi.addChapter(this.chapter)
            .then(response => {
                // 关闭弹框
                this.dialogChapterFormVisible=false

                // 提示信息
                this.$message({
                        type: 'success',
                        message: '添加章节成功!'
                    })

                // 刷新页面
                this.getAllChapterVideo()
            })
    },


    // 修改章节
    updateChapter() {
        chapterApi.updateChapter(this.chapter)
            .then(response => {
              // 关闭弹框
                this.dialogChapterFormVisible=false

                // 提示信息
                this.$message({
                        type: 'success',
                        message: '修改章节成功!'
                    })

                // 刷新页面
                this.getAllChapterVideo()
              
            })
    },

    saveOrUpdate() {

        //判断是否有id 有就是修改 
        if(!this.chapter.id) {
            this.addChapter()
        } else {
          this.updateChapter()
        }
        

    },

    // 根据课程id获取章节和小节数据
    getAllChapterVideo() {
      chapterApi.getAllChapterVideo(this.courseId)
        .then(response => {
          this.chapterVideoList = response.data.allChapterVideo
        })
    },

      // 上一步
    previous() {
        this.$router.push({ path: '/edu/course/info/' + this.courseId})
    },

    // 下一步
    next() {
      console.log('next')
      this.$router.push({ path: '/edu/course/publish/'+ this.courseId})
    }
  }
}
</script>


<style scoped>
.chanpterList{
    position: relative;
    list-style: none;
    margin: 0;
    padding: 0;
}
.chanpterList li{
  position: relative;
}
.chanpterList p{
  float: left;
  font-size: 20px;
  margin: 10px 0;
  padding: 10px;
  height: 70px;
  line-height: 50px;
  width: 100%;
  border: 1px solid #DDD;
}
.chanpterList .acts {
    float: right;
    font-size: 14px;
}
.videoList{
  padding-left: 50px;
}
.videoList p{
  float: left;
  font-size: 14px;
  margin: 10px 0;
  padding: 10px;
  height: 50px;
  line-height: 30px;
  width: 100%;
  border: 1px dotted #DDD;
}
#xxx{
  text-align:center;
}
</style>
