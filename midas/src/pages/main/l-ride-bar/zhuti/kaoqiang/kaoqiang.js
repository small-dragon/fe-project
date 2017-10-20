import { mapState } from 'vuex'
export default {
    data () {
        return {
            items: {
                none: '不靠墙',
                left: '左靠墙',
                right: '右靠墙',
                both: '两端靠墙'
            },
            curKey: '',
            showTipBtn: false,
            showBtn: false,
            type: ''
        }
    },
    watch: {
        curKey (newVal, oldVal) {
            if (!oldVal) return
            this.showBtn = true 
        }
    },
    computed: {
        ...mapState({
            mainCanvas: 'mainCanvas',
            zhuti: 'zhuti'
        })
    },
    created() {
        const map = {
            1: 'straight',
            2: 'L',
            3: 'U'
        }
        this.curKey = this.zhuti.wallStyle
        this.type = map[this.zhuti.type]
    },
    methods: {
        async hideTipBtn () {
            await this.$sleep(3000)
            this.showTipBtn = false
        },
        async build3d () {
            this.showTipBtn = true
            this.hideTipBtn()
            this.mainCanvas.updateCanvas([{
                type: 'wall',
                value: this.curKey
            }])
            this.$store.commit('getInfo')
        }
    }
}