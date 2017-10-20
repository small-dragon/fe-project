export default {
    watch: {
        '$route'(to, from){
            document.body.scrollTop = '0'
        }
    }
};