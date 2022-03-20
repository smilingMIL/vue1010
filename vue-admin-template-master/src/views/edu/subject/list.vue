<template>
  <div class="app-container">
    <el-input v-model="filterText" placeholder="Filter keyword" style="margin-bottom:30px;" />

    <el-tree
      ref="tree2"
      :data="data2"
      :props="defaultProps"
      :filter-node-method="filterNode"
      class="filter-tree"
      default-expand-all
    />

  </div>
</template>

<script>

import subjectApi from '@/api/edu/subject'

export default {

  data() {
    return {
      filterText: '',
      data2: [],    // 返回所有分类的数据
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    }
  },
  
  created() {   // 页面渲染之前执行

        this.getAllSubjectList()
        
  },

  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val)
    }
  },

  methods: {

      // 查询课程分类列表
      getAllSubjectList() {
        subjectApi.getSubjectList()
            .then(respone => {
                this.data2 = respone.data.list
            })
      },

      // 检索功能
    filterNode(value, data) {
      if (!value) return true
      // toLowerCase() :这个方法是查询时不区分大小写
      return data.title.toLowerCase().indexOf(value) !== -1
    }
  }
}
</script>

