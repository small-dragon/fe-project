import { mapState } from 'vuex'
export default {
    data () {
        return {
            sectionsData: [],
            sectionNum: 0
        }
    },
    components: {
        'comp-section': require('./section/section.vue')
    },
    computed: {
        ...mapState(['mainCanvas', 'xiguan', 'xiguanIndex', 'zhuti'])
    },
    async created () {
        this.selectSection(this.xiguanIndex)
        const type = this.zhuti.type
        this.sectionNum = +type
    },
    methods: {
        selectSection(index) {
            this.$store.state.xiguanIndex =index
            this.mainCanvas.select({
                action: 'all',
                type:'smallColumn',
                index
            })
            this.$store.state.xiguanAllSelect = true
        }
    }
}