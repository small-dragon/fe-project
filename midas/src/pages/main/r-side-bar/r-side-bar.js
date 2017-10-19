import { mapState } from 'vuex'
export default {
	data () {
		return {
			curIdx: 0,
            typeMap: [
                { type: 'zhuti', name: '主体' },
                { type: 'lizhu', name: '立柱' },
                { type: 'xiguan', name: '细管' },
                { type: 'duangai', name: '端盖' }
            ],
		}
	},
    computed: {
        ...mapState([
            'rInfo', 'zhuti', 'lizhu', 'xiguan', 'duangai', 'mainCanvas', 'xiguanIndex'
        ])
    },
	created () {

	},
	methods: {
        changeType (index) {
            const { typeMap } = this
            if (index == 0) {
                this.mainCanvas.clearSelect()
            }

            if (index == 1) {
                this.mainCanvas.select({action:'column'})
            }

            if (index == 2) {
                this.mainCanvas.select({
                    action: 'all',
                    type:'smallColumn',
                    index: this.xiguanIndex
                })
                this.$store.state.xiguanAllSelect = true
            }

            if (index == 3) {
                this.mainCanvas.select({action:'endCover'})
            }
            this.$store.state.rInfo = typeMap[index]
        }
	}
}