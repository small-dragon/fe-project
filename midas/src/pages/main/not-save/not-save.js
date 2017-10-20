import { mapState } from 'vuex'
export default {
	data () {
		return {

		}
	},
	created () {

	},
	methods: {
		hide () {
			this.$store.state.showNotSave = false
			this.$router.push(`/home`)
		},
		save () {
			this.$store.state.showNotSave = false
			this.$store.state.showWork = true
		}
	}
}