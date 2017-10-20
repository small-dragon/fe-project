import { mapState } from 'vuex'
export default {
    data () {
        return {
            height_curKey: '',
            widthList: [],
            curKey: 'height',
            isLoading: true,
            showTipBtn: false,
            showConfirmBth: false,
        }
    },
    computed: {
        ...mapState({
            config: 'wuliaoConfig',
            canvas: 'mainCanvas',
            lizhu: 'lizhu',
            zhuti: 'zhuti'
        }),
    }, 
    watch: {
        lizhu: {
            deep: true,
            handler (newVal, oldVal) {
                this.height_curKey = this.lizhu.product.code
            }
        },
        height_curKey (newVal, oldVal) {
            this.judgeIsChanged()
        }
    },
    created () {
        this.config.data.forEach(f => {
            this.widthList.push({
                width: (f.width / 1000),
                segments: f.segments
            })
        })
        this.height_curKey = this.lizhu.product.code
        this.isLoading = false
    },
    methods: {
        async hideTipBtn () {
            await this.$sleep(3000)
            this.showTipBtn = false
        },
        build3d () {
            if (!this.updateBeforeCorrect()) return this.$pop.showMessage(`请输入正确的值`)
            let params = []
            this.showConfirmBth = false
            this.showTipBtn = true
            this.widthList.forEach((f, i) => {
                params.push({
                    type: 'length',
                    index: i,
                    length: f.width * 1000
                },{
                    type: 'segments',
                    index: i,
                    segments: f.segments
                })
            })
            params.push({
                type: 'column',
                code: this.height_curKey
            })
            this.hideTipBtn()
            this.canvas.updateCanvas(params)
            this.$store.commit('getInfo')
        },
        selectSide (index) {
            this.curKey = index
            this.canvas.select({
                action: 'all',
                index
            })
        },
        updateBeforeCorrect () {
            let isCorrect = true
            this.widthList.forEach((f, i) => {
                if (isNaN(+f.width)) isCorrect = false 
                if (isNaN(+f.segments)) isCorrect = false 
            })
            return isCorrect
        },
        judgeIsChanged () {
            let isChanged = false
            this.widthList.forEach((f, i) => {
                if (f.width != this.config.data[i].width) isChanged = true
                if (f.segments != this.config.data[i].segments) isChanged = true
            })
            if (this.height_curKey != this.lizhu.product.code) isChanged = true
            this.showConfirmBth = isChanged ? true : false
        }
    }
}