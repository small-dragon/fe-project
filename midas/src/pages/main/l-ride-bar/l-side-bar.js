import { mapState } from 'vuex'
export default {
    data () {
        return {
            d3Config: {},  // 3d配置
            regularData: {}
        }
    },
    computed: {
        ...mapState(['rInfo']),
    },
    components: {
        'zhuti': require('./zhuti/zhuti.vue'),
        'lizhu': require('./lizhu/lizhu.vue'),
        'xiguan': require('./xiguan/xiguan.vue'),
        'duangai': require('./duangai/duangai.vue')
    },
    async created () {
    },
    methods: {
        
    },
}